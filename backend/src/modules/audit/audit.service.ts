import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

// DAT-04: AuditEvent append-only; ghi actor, action, resource, reason, correlation_id.
// Không có update/delete method ở đây theo thiết kế — chỉ append.
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    tenantId?: string;
    actorUserId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    reason?: string;
  }) {
    return this.prisma.auditEvent.create({
      data: {
        tenantId: params.tenantId,
        actorUserId: params.actorUserId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        reason: params.reason,
      },
    });
  }
}
