import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IamModule } from './modules/iam/iam.module';
import { TrackRegistryModule } from './modules/track-registry/track-registry.module';
import { ExamDeliveryModule } from './modules/exam-delivery/exam-delivery.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    IamModule,
    TrackRegistryModule,
    ExamDeliveryModule,
    AuditModule,
  ],
})
export class AppModule {}
