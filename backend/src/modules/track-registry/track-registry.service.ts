import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

// MOD-TRK: Track & Framework Registry.
// D01: quản lý route_code, framework_version, các policy binding; không hard-code quy tắc tuyến.
@Injectable()
export class TrackRegistryService {
  constructor(private readonly prisma: PrismaService) {}

  // Danh sách tuyến để hiển thị màn "Chọn tuyến" (BR-J01)
  async listTracks(tenantId: string) {
    return this.prisma.track.findMany({
      where: { tenantId },
      select: { id: true, code: true, name: true, status: true },
      orderBy: { code: 'asc' },
    });
  }

  // FR-TRK-04 capability API: cho biết tuyến này đã có program_version nào đang mở,
  // dùng để Exam Delivery kiểm tra trước khi cho đăng ký.
  async getTrackCapability(trackId: string) {
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      include: {
        examPrograms: {
          where: { isLocked: false },
          select: { id: true, programVersion: true },
        },
        frameworkVersions: {
          select: { id: true, versionLabel: true, isImmutable: true },
        },
      },
    });
    if (!track) throw new NotFoundException('Track không tồn tại');
    return track;
  }
}
