import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProfileDto } from './dto/create-profile.dto';

// MOD-IAM: người dùng, hồ sơ, danh tính.
// BR-20: một người có một identity profile hợp nhất (ở mức MVP: unique theo tenant+email).
@Injectable()
export class IamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createProfile(dto: CreateProfileDto) {
    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: dto.tenantId, email: dto.email } },
    });
    if (existing) {
      throw new ConflictException('Email đã được đăng ký trong tổ chức này (BR-20: một người - một hồ sơ)');
    }

    const user = await this.prisma.user.create({
      data: {
        tenantId: dto.tenantId,
        email: dto.email,
        phone: dto.phone,
        profile: {
          create: {
            tenantId: dto.tenantId,
            fullName: dto.fullName,
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
            nationality: dto.nationality,
            preferredLanguage: dto.preferredLanguage ?? 'vi',
          },
        },
      },
      include: { profile: true },
    });

    await this.audit.record({
      tenantId: dto.tenantId,
      actorUserId: user.id,
      action: 'PROFILE_CREATED',
      resourceType: 'PersonProfile',
      resourceId: user.profile?.id,
    });

    return user;
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }
}
