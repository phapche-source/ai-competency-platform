import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { IamService } from './iam.service';
import { IamController } from './iam.controller';

@Module({
  imports: [AuditModule],
  controllers: [IamController],
  providers: [PrismaService, IamService],
  exports: [IamService],
})
export class IamModule {}
