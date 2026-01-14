import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('enrollments')
export class EnrollmentController {
    constructor(private readonly enrollmentService: EnrollmentService) { }

    /**
     * PARTE 4: Endpoint para matricular estudiante (Transacción ACID)
     */
    @Post()
    enrollStudent(@Body() createEnrollmentDto: CreateEnrollmentDto) {
        return this.enrollmentService.enrollStudent(createEnrollmentDto);
    }

    /**
     * PARTE 3: Reporte SQL nativo - Estudiantes con total de materias matriculadas
     * ⚠️ RUTA FIJA - Debe estar ANTES de rutas dinámicas
     */
    @Get('report')
    getEnrollmentReport() {
        return this.enrollmentService.getEnrollmentReport();
    }

    /**
     * PARTE 1.D: Matrículas de un estudiante en un período académico
     * ⚠️ RUTA FIJA CON PARÁMETROS - Debe estar ANTES de /:id simple
     */
    @Get('student/:studentId/period/:periodId')
    getStudentEnrollmentsByPeriod(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('periodId', ParseIntPipe) periodId: number,
    ) {
        return this.enrollmentService.getStudentEnrollmentsByPeriod(studentId, periodId);
    }

    @Get()
    findAll() {
        return this.enrollmentService.findAll();
    }

    /**
     * ⚠️ RUTA DINÁMICA - Debe estar DESPUÉS de rutas fijas
     */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.enrollmentService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.enrollmentService.remove(id);
    }
}
