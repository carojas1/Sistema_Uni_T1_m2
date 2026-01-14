import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaAcademicService } from '../prisma/prisma-academic.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

interface EnrollmentReportRow {
    student_name: string;
    career_name: string;
    total_subjects: bigint;
}

@Injectable()
export class EnrollmentService {
    constructor(private prismaAcademic: PrismaAcademicService) { }

    /**
     * PARTE 4: Transacción ACID para matricular estudiante
     * - Atomic: Todo-o-nada mediante $transaction
     * - Consistent: Validaciones de negocio (estudiante activo, cupos disponibles)
     * - Isolated: UPDATE con WHERE para evitar race conditions
     * - Durable: PostgreSQL garantiza persistencia
     */
    async enrollStudent(createEnrollmentDto: CreateEnrollmentDto) {
        return this.prismaAcademic.$transaction(async (prisma) => {
            // 1. Verificar que el estudiante existe y está activo
            const student = await prisma.student.findUnique({
                where: { id: createEnrollmentDto.studentId },
            });

            if (!student) {
                throw new NotFoundException(`Student with ID ${createEnrollmentDto.studentId} not found`);
            }

            if (!student.isActive) {
                throw new BadRequestException(`Student with ID ${createEnrollmentDto.studentId} is not active`);
            }

            // 2. Verificar que la materia existe
            const subject = await prisma.subject.findUnique({
                where: { id: createEnrollmentDto.subjectId },
            });

            if (!subject) {
                throw new NotFoundException(`Subject with ID ${createEnrollmentDto.subjectId} not found`);
            }

            // 3. Verificar que el periodo académico existe y está activo
            const academicPeriod = await prisma.academicPeriod.findUnique({
                where: { id: createEnrollmentDto.academicPeriodId },
            });

            if (!academicPeriod) {
                throw new NotFoundException(`Academic period with ID ${createEnrollmentDto.academicPeriodId} not found`);
            }

            if (!academicPeriod.isActive) {
                throw new BadRequestException(`Academic period "${academicPeriod.name}" is not active`);
            }

            // 4. Verificar cupos disponibles ANTES de intentar matricular
            if (subject.availableQuota <= 0) {
                throw new BadRequestException(`No available quota for subject "${subject.name}"`);
            }

            // 5. Verificar que no exista matrícula duplicada (ya cubierto por unique constraint, pero validamos antes)
            const existingEnrollment = await prisma.enrollment.findUnique({
                where: {
                    studentId_subjectId_academicPeriodId: {
                        studentId: createEnrollmentDto.studentId,
                        subjectId: createEnrollmentDto.subjectId,
                        academicPeriodId: createEnrollmentDto.academicPeriodId,
                    },
                },
            });

            if (existingEnrollment) {
                throw new ConflictException(
                    `Student is already enrolled in this subject for the selected academic period`,
                );
            }

            // 6. Decrementar cupo disponible con condición WHERE (evita race condition)
            // Si 2 transacciones intentan matricularse al mismo tiempo, solo una logrará decrementar
            const updateResult = await prisma.subject.updateMany({
                where: {
                    id: createEnrollmentDto.subjectId,
                    availableQuota: {
                        gt: 0, // Solo actualiza si hay cupos disponibles
                    },
                },
                data: {
                    availableQuota: {
                        decrement: 1,
                    },
                },
            });

            // Si no se actualizó ningún registro, significa que ya no hay cupos (race condition)
            if (updateResult.count === 0) {
                throw new BadRequestException(`No available quota for subject "${subject.name}" (concurrent enrollment)`);
            }

            // 7. Registrar la matrícula
            const enrollment = await prisma.enrollment.create({
                data: {
                    studentId: createEnrollmentDto.studentId,
                    subjectId: createEnrollmentDto.subjectId,
                    academicPeriodId: createEnrollmentDto.academicPeriodId,
                    enrolledAt: createEnrollmentDto.enrolledAt ? new Date(createEnrollmentDto.enrolledAt) : new Date(),
                },
                include: {
                    student: true,
                    subject: {
                        include: {
                            career: true,
                            cycle: true,
                        },
                    },
                    academicPeriod: true,
                },
            });

            return {
                message: 'Student successfully enrolled',
                enrollment,
            };
        });
    }

    /**
     * PARTE 1.D: Mostrar matrículas de un estudiante en un período académico determinado
     */
    async getStudentEnrollmentsByPeriod(studentId: number, academicPeriodId: number) {
        const student = await this.prismaAcademic.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${studentId} not found`);
        }

        const period = await this.prismaAcademic.academicPeriod.findUnique({
            where: { id: academicPeriodId },
        });

        if (!period) {
            throw new NotFoundException(`Academic period with ID ${academicPeriodId} not found`);
        }

        const enrollments = await this.prismaAcademic.enrollment.findMany({
            where: {
                studentId,
                academicPeriodId,
            },
            include: {
                subject: {
                    include: {
                        career: true,
                        cycle: true,
                    },
                },
                academicPeriod: true,
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });

        return {
            student: {
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
            },
            academicPeriod: {
                id: period.id,
                name: period.name,
            },
            enrollments,
            totalEnrolled: enrollments.length,
        };
    }

    /**
     * PARTE 3: Consulta SQL nativa - Reporte de estudiantes con total de materias matriculadas
     * Ordenado por número de materias DESC
     */
    async getEnrollmentReport() {
        const rawResults = await this.prismaAcademic.$queryRaw<EnrollmentReportRow[]>`
      SELECT 
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.name as career_name,
        COUNT(e.id)::bigint as total_subjects
      FROM students s
      INNER JOIN careers c ON s.career_id = c.id
      LEFT JOIN enrollments e ON s.id = e.student_id
      GROUP BY s.id, s.first_name, s.last_name, c.name
      HAVING COUNT(e.id) > 0
      ORDER BY total_subjects DESC
    `;

        // Convertir bigint a number para serialización JSON
        const results = rawResults.map((row) => ({
            studentName: row.student_name,
            careerName: row.career_name,
            totalSubjects: Number(row.total_subjects),
        }));

        return {
            report: results,
            totalStudents: results.length,
            generatedAt: new Date().toISOString(),
        };
    }

    async findAll() {
        return this.prismaAcademic.enrollment.findMany({
            include: {
                student: true,
                subject: {
                    include: {
                        career: true,
                        cycle: true,
                    },
                },
                academicPeriod: true,
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });
    }

    async findOne(id: number) {
        const enrollment = await this.prismaAcademic.enrollment.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        career: true,
                    },
                },
                subject: {
                    include: {
                        career: true,
                        cycle: true,
                    },
                },
                academicPeriod: true,
            },
        });

        if (!enrollment) {
            throw new NotFoundException(`Enrollment with ID ${id} not found`);
        }

        return enrollment;
    }

    async remove(id: number) {
        const enrollment = await this.findOne(id);

        // Transacción para eliminar matrícula y devolver cupo
        return this.prismaAcademic.$transaction(async (prisma) => {
            // Incrementar cupo disponible
            await prisma.subject.update({
                where: { id: enrollment.subjectId },
                data: {
                    availableQuota: {
                        increment: 1,
                    },
                },
            });

            // Eliminar matrícula
            return prisma.enrollment.delete({
                where: { id },
            });
        });
    }
}
