import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AcademicPeriodService } from './academic-period.service';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';

@Controller('academic-periods')
export class AcademicPeriodController {
    constructor(private readonly academicPeriodService: AcademicPeriodService) { }

    @Post()
    create(@Body() createAcademicPeriodDto: CreateAcademicPeriodDto) {
        return this.academicPeriodService.create(createAcademicPeriodDto);
    }

    /**
     * ⚠️ RUTA FIJA - Debe estar ANTES de /:id
     */
    @Get('active')
    findActive() {
        return this.academicPeriodService.findActive();
    }

    @Get()
    findAll() {
        return this.academicPeriodService.findAll();
    }

    /**
     * ⚠️ RUTA DINÁMICA - Debe estar DESPUÉS de rutas fijas
     */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.academicPeriodService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateAcademicPeriodDto: UpdateAcademicPeriodDto,
    ) {
        return this.academicPeriodService.update(id, updateAcademicPeriodDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.academicPeriodService.remove(id);
    }
}
