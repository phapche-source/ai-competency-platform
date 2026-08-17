import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { ExamDeliveryService } from './exam-delivery.service';
import { ExamDeliveryController } from './exam-delivery.controller';

@Module({
  imports: [AuditModule],
  controllers: [ExamDeliveryController],
  providers: [PrismaService, ExamDeliveryService],
  exports: [ExamDeliveryService],
})
export class ExamDeliveryModule {}
