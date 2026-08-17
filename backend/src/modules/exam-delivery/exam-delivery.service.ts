import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRegistrationDto, ScheduleRegistrationDto } from './dto/create-registration.dto';
import { RegistrationStatus } from '@prisma/client';

// MOD-EXM (phạm vi Đợt 1): BR-J01 chọn tuyến -> BR-J02 hồ sơ -> BR-J03 đủ điều kiện -> BR-J04 đặt lịch.
// State machine SRS 5.3: DRAFT -> ELIGIBILITY_PENDING -> ELIGIBLE -> SCHEDULED -> CHECKED_IN -> COMPLETED/CANCELLED/NO_SHOW
const ALLOWED_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  DRAFT: ['ELIGIBILITY_PENDING', 'CANCELLED'],
  ELIGIBILITY_PENDING: ['ELIGIBLE', 'CANCELLED'],
  ELIGIBLE: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
  CHECKED_IN: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

@Injectable()
export class ExamDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // BR-J01 + BR-01: mỗi registration thuộc đúng một route_code và một exam_program_version.
  async createRegistration(dto: CreateRegistrationDto) {
    const program = await this.prisma.examProgram.findUnique({
      where: { id: dto.examProgramId },
    });
    if (!program) throw new NotFoundException('exam_program không tồn tại');
    if (program.trackId !== dto.trackId) {
      throw new BadRequestException('exam_program không thuộc track đã chọn (vi phạm BR-01)');
    }
    // BR-02: không cho tạo mới nếu chương trình đã khóa đề (mở đề) — phải hủy + đăng ký mới.
    if (program.isLocked) {
      throw new BadRequestException('Chương trình thi đã khóa đề (mở đề) — không thể đăng ký trực tiếp, cần luồng đăng ký mới có audit (BR-02)');
    }

    const registration = await this.prisma.registration.create({
      data: {
        tenantId: dto.tenantId,
        personProfileId: dto.personProfileId,
        trackId: dto.trackId,
        examProgramId: dto.examProgramId,
        examEventId: dto.examEventId,
        status: RegistrationStatus.DRAFT,
      },
    });

    await this.audit.record({
      tenantId: dto.tenantId,
      action: 'REGISTRATION_CREATED',
      resourceType: 'Registration',
      resourceId: registration.id,
    });

    return registration;
  }

  // BR-J03: Rule Engine kiểm tra điều kiện dự thi (MVP: kiểm tra hồ sơ đã có full_name, DOB).
  async evaluateEligibility(registrationId: string) {
    const reg = await this.getOrThrow(registrationId);
    this.assertTransition(reg.status, RegistrationStatus.ELIGIBILITY_PENDING);

    const profile = await this.prisma.personProfile.findUnique({
      where: { id: reg.personProfileId },
    });
    const eligible = !!profile?.fullName && !!profile?.dateOfBirth;

    const nextStatus = eligible ? RegistrationStatus.ELIGIBLE : RegistrationStatus.ELIGIBILITY_PENDING;
    const updated = await this.transition(reg.id, nextStatus, eligible ? undefined : 'Hồ sơ thiếu thông tin bắt buộc (ngoại lệ cần người duyệt theo BR-J03)');
    return updated;
  }

  // BR-J04: đặt lịch — chọn kỳ thi/trung tâm.
  async schedule(registrationId: string, dto: ScheduleRegistrationDto) {
    const reg = await this.getOrThrow(registrationId);
    this.assertTransition(reg.status, RegistrationStatus.SCHEDULED);

    const event = await this.prisma.examEvent.findUnique({ where: { id: dto.examEventId } });
    if (!event || event.examProgramId !== reg.examProgramId) {
      throw new BadRequestException('exam_event không thuộc đúng exam_program của registration');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: { examEventId: dto.examEventId, status: RegistrationStatus.SCHEDULED, updatedAt: new Date() },
      });
      await this.audit.record({
        tenantId: reg.tenantId,
        action: 'REGISTRATION_SCHEDULED',
        resourceType: 'Registration',
        resourceId: reg.id,
      });
      return updated;
    });
  }

  async cancel(registrationId: string, reason: string) {
    const reg = await this.getOrThrow(registrationId);
    this.assertTransition(reg.status, RegistrationStatus.CANCELLED);
    return this.transition(reg.id, RegistrationStatus.CANCELLED, reason);
  }

  async get(registrationId: string) {
    return this.getOrThrow(registrationId);
  }

  private async getOrThrow(id: string) {
    const reg = await this.prisma.registration.findUnique({ where: { id } });
    if (!reg) throw new NotFoundException('Registration không tồn tại');
    return reg;
  }

  private assertTransition(from: RegistrationStatus, to: RegistrationStatus) {
    if (!ALLOWED_TRANSITIONS[from]?.includes(to)) {
      throw new BadRequestException(`Không thể chuyển trạng thái ${from} -> ${to} (vi phạm state machine SRS 5.3)`);
    }
  }

  private async transition(id: string, status: RegistrationStatus, reason?: string) {
    const updated = await this.prisma.registration.update({
      where: { id },
      data: { status, eligibilityNote: reason, updatedAt: new Date() },
    });
    await this.audit.record({
      action: `REGISTRATION_STATUS_${status}`,
      resourceType: 'Registration',
      resourceId: id,
      reason,
    });
    return updated;
  }
}
