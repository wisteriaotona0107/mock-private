import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Controller('diagnoses')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() body: unknown) {
    const userId = req?.user?.userId ?? null;
    return this.diagnosisService.create(userId, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosisService.findOne(id);
  }
}
