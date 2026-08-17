import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrackRegistryService } from './track-registry.service';

@Controller('tracks')
export class TrackRegistryController {
  constructor(private readonly service: TrackRegistryService) {}

  @Get()
  list(@Query('tenantId') tenantId: string) {
    return this.service.listTracks(tenantId);
  }

  @Get(':id/capability')
  capability(@Param('id') id: string) {
    return this.service.getTrackCapability(id);
  }
}
