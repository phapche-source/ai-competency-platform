import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { TrackRegistryService } from './track-registry.service';
import { TrackRegistryController } from './track-registry.controller';

@Module({
  controllers: [TrackRegistryController],
  providers: [PrismaService, TrackRegistryService],
  exports: [TrackRegistryService],
})
export class TrackRegistryModule {}
