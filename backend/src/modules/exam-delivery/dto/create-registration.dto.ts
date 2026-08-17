import { IsUUID, IsOptional } from 'class-validator';

// BR-J01: chọn tuyến -> khóa route_code cho registration.
export class CreateRegistrationDto {
  @IsUUID()
  tenantId!: string;

  @IsUUID()
  personProfileId!: string;

  @IsUUID()
  trackId!: string;

  @IsUUID()
  examProgramId!: string;

  @IsOptional()
  @IsUUID()
  examEventId?: string;
}

export class ScheduleRegistrationDto {
  @IsUUID()
  examEventId!: string;
}
