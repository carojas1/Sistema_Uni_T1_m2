import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  /**
   * PARTE 1.A: Estudiantes activos con su carrera
   * ⚠️ RUTA FIJA - Debe estar ANTES de /:id
   */
  @Get('active-with-career')
  findActiveWithCareer() {
    return this.studentService.findActiveWithCareer();
  }

  /**
   * PARTE 2.E: Filtrar estudiantes (activos + carrera + periodo)
   * ⚠️ RUTA FIJA - Debe estar ANTES de /:id
   */
  @Get('filter')
  findActiveByCareerAndPeriod(
    @Query('careerId', ParseIntPipe) careerId: number,
    @Query('periodId', ParseIntPipe) periodId: number,
  ) {
    return this.studentService.findActiveByCareerAndPeriod(careerId, periodId);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.studentService.findAll(parseInt(page), parseInt(limit));
  }

  /**
   * ⚠️ RUTA DINÁMICA - Debe estar DESPUÉS de rutas fijas
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }
}