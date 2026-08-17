import { IsEmail, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProfileDto {
  @IsUUID()
  tenantId!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string; // ISO date

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;
}
