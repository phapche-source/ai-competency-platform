import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from './audit.service';

@Module({
  providers: [PrismaService, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
