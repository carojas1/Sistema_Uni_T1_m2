import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) { }

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  /**
   * PARTE 1.C: Docentes que imparten más de una asignatura
   * ⚠️ RUTA FIJA - Debe estar ANTES de /:id
   */
  @Get('multiple-subjects')
  findTeachingMultipleSubjects() {
    return this.teacherService.findTeachingMultipleSubjects();
  }

  /**
   * PARTE 2.F: Filtro complejo con operadores AND/OR/NOT
   * ⚠️ RUTA FIJA - Debe estar ANTES de /:id
   */
  @Get('filter-complex')
  findWithComplexFilter() {
    return this.teacherService.findWithComplexFilter();
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.teacherService.findAll(parseInt(page), parseInt(limit));
  }

  /**
   * ⚠️ RUTA DINÁMICA - Debe estar DESPUÉS de rutas fijas
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }
}