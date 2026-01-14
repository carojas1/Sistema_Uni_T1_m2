import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaAcademicService } from '../prisma/prisma-academic.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(private prismaAcademic: PrismaAcademicService) { }

  async create(createStudentDto: CreateStudentDto) {
    const career = await this.prismaAcademic.career.findUnique({
      where: { id: createStudentDto.careerId },
    });

    if (!career) {
      throw new BadRequestException(`Career with ID ${createStudentDto.careerId} not found`);
    }

    return this.prismaAcademic.student.create({
      data: createStudentDto,
      include: {
        career: {
          include: {
            specialty: true,
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaAcademic.student.findMany({
        skip,
        take: limit,
        include: {
          career: {
            include: {
              specialty: true,
            },
          },
        },
      }),
      this.prismaAcademic.student.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const student = await this.prismaAcademic.student.findUnique({
      where: { id },
      include: {
        career: {
          include: {
            specialty: true,
          },
        },
        subjects: {
          include: {
            subject: {
              include: {
                cycle: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    await this.findOne(id);

    if (updateStudentDto.careerId) {
      const career = await this.prismaAcademic.career.findUnique({
        where: { id: updateStudentDto.careerId },
      });

      if (!career) {
        throw new BadRequestException(`Career with ID ${updateStudentDto.careerId} not found`);
      }
    }

    return this.prismaAcademic.student.update({
      where: { id },
      data: updateStudentDto,
      include: {
        career: {
          include: {
            specialty: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prismaAcademic.student.delete({
      where: { id },
    });
  }

  /**
   * PARTE 1.A: Listar todos los estudiantes activos junto con su carrera
   * GET /students/active-with-career
   */
  async findActiveWithCareer() {
    return this.prismaAcademic.student.findMany({
      where: {
        isActive: true,
      },
      include: {
        career: {
          include: {
            specialty: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  /**
   * PARTE 2.E: Buscar estudiantes que:
   * - estén activos AND
   * - pertenezcan a una carrera específica AND
   * - tengan matrícula en un período académico seleccionado
   * GET /students/filter?careerId=X&periodId=Y
   */
  async findActiveByCareerAndPeriod(careerId: number, periodId: number) {
    return this.prismaAcademic.student.findMany({
      where: {
        AND: [
          { isActive: true },
          { careerId: careerId },
          {
            enrollments: {
              some: {
                academicPeriodId: periodId,
              },
            },
          },
        ],
      },
      include: {
        career: {
          include: {
            specialty: true,
          },
        },
        enrollments: {
          where: {
            academicPeriodId: periodId,
          },
          include: {
            subject: {
              include: {
                cycle: true,
              },
            },
            academicPeriod: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }
}