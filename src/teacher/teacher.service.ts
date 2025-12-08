import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaAcademicService } from '../prisma/prisma-academic.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
  constructor(private prismaAcademic: PrismaAcademicService) {}

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
}