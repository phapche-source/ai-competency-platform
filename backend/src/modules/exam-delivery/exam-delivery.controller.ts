import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ExamDeliveryService } from './exam-delivery.service';
import { CreateRegistrationDto, ScheduleRegistrationDto } from './dto/create-registration.dto';

@Controller('registrations')
export class ExamDeliveryController {
  constructor(private readonly service: ExamDeliveryService) {}

  @Post()
  create(@Body() dto: CreateRegistrationDto) {
    return this.service.createRegistration(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Patch(':id/evaluate-eligibility')
  evaluate(@Param('id') id: string) {
    return this.service.evaluateEligibility(id);
  }

  @Patch(':id/schedule')
  schedule(@Param('id') id: string, @Body() dto: ScheduleRegistrationDto) {
    return this.service.schedule(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.cancel(id, reason);
  }
}
