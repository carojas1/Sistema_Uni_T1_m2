import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaAcademicService } from '../prisma/prisma-academic.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(private prismaAcademic: PrismaAcademicService) { }

  create(createTeacherDto: CreateTeacherDto) {
    return this.prismaAcademic.teacher.create({
      data: createTeacherDto,
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaAcademic.teacher.findMany({
        skip,
        take: limit,
        include: {
          subjects: {
            include: {
              subject: true,
            },
          },
        },
      }),
      this.prismaAcademic.teacher.count(),
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
    const teacher = await this.prismaAcademic.teacher.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: {
              include: {
                career: true,
                cycle: true,
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    await this.findOne(id);

    return this.prismaAcademic.teacher.update({
      where: { id },
      data: updateTeacherDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prismaAcademic.teacher.delete({
      where: { id },
    });
  }

  /**
   * PARTE 1.C: Listar docentes que imparten más de una asignatura
   * GET /teachers/multiple-subjects
   */
  async findTeachingMultipleSubjects() {
    // Obtener docentes con conteo de materias
    const teachers = await this.prismaAcademic.teacher.findMany({
      include: {
        subjects: {
          include: {
            subject: {
              include: {
                career: true,
                cycle: true,
              },
            },
          },
        },
      },
    });

    // Filtrar docentes con más de una materia
    const teachersWithMultipleSubjects = teachers.filter((teacher) => teacher.subjects.length > 1);

    return teachersWithMultipleSubjects.map((teacher) => ({
      ...teacher,
      totalSubjects: teacher.subjects.length,
    }));
  }

  /**
   * PARTE 2.F: Filtrar docentes que:
   * - sean de tiempo completo (FULL_TIME) AND
   * - dicten asignaturas (subjects count > 0) OR
   * - NOT estén inactivos (isActive = true)
   *
   * Interpretación: (employmentType = FULL_TIME) AND (tiene materias OR está activo)
   * Esto significa: docentes de tiempo completo que enseñan O que están activos
   */
  async findWithComplexFilter() {
    const teachers = await this.prismaAcademic.teacher.findMany({
      where: {
        AND: [
          {
            employmentType: 'FULL_TIME',
          },
          {
            OR: [
              {
                subjects: {
                  some: {}, // Tiene al menos una materia asignada
                },
              },
              {
                NOT: {
                  isActive: false, // NOT inactivo = activo
                },
              },
            ],
          },
        ],
      },
      include: {
        subjects: {
          include: {
            subject: {
              include: {
                career: true,
                cycle: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    });

    return teachers.map((teacher) => ({
      ...teacher,
      totalSubjects: teacher.subjects.length,
    }));
  }
}