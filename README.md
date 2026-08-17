# Nền tảng Đánh giá Năng lực AI — Sprint 0 + MVP Đợt 1

Scaffold theo BRD/SRS D01-D10 và Roadmap 12 bước (đã cung cấp).
Phạm vi bản này: **Sprint 0** (repo, schema, IAM/Track Registry/Audit khung)
+ **Đợt 1 MVP** (đăng ký, hồ sơ, chọn tuyến, lịch thi) cho tuyến **AI-HE**
(theo D01: AI-HE pilot trước, 3 tuyến còn lại kích hoạt bằng cấu hình).

## Hạ tầng đã dựng

- **Supabase project**: `AI-Competency-Platform` (ref `qkxnckegzoalgfhydwvx`, region ap-southeast-1)
- **Schema đã áp dụng** (migration `001_core_identity_track_exam`, `002_seed_tenant_tracks`):
  cụm Identity (tenants, users, person_profiles, external_identities, consents, accommodations),
  cụm Track (tracks, framework_versions, track_policy_bindings — theo D01),
  cụm Exam (exam_programs, exam_events, registrations với state machine SRS 5.3),
  Audit append-only (audit_events — DAT-04).
- Đã seed: 1 tenant (`AIVAC-VN`) + 4 track (AI-HE, AI-GV, AI-VET, AI-GVET) ở trạng thái `DRAFT`,
  và 7 role cơ bản theo BRD 4.2.

## Cấu trúc

```
backend/   NestJS Modular Monolith (D03)
  src/modules/iam/            MOD-IAM  — hồ sơ người dùng (BR-J02, BR-20)
  src/modules/track-registry/ MOD-TRK  — danh sách tuyến, capability API (D01)
  src/modules/exam-delivery/  MOD-EXM  — đăng ký, state machine (BR-01/02, BR-J01-J04)
  src/modules/audit/          MOD-AUD  — audit append-only (DAT-04)
  prisma/schema.prisma        khớp 1:1 với schema đã tạo trên Supabase

frontend/  Next.js — luồng "Chọn tuyến" -> "Tạo hồ sơ & đăng ký" (BR-J01/J02)
```

## Chạy thử (local)

```bash
cd backend
cp .env.example .env   # điền mật khẩu DB thật từ Supabase Dashboard > Settings > Database
npm install
npx prisma generate
npm run start:dev      # http://localhost:3001/api/v1

cd ../frontend
npm install
# tạo .env.local với:
# NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1
# NEXT_PUBLIC_TENANT_ID=<lấy từ bảng tenants trong Supabase>
npm run dev             # http://localhost:3000
```

> Lưu ý: trong sandbox tạo file này, `npx prisma generate` không tải được binary
> engine do mạng bị giới hạn domain — sẽ chạy bình thường trên máy chị hoặc khi
> deploy lên Railway (không bị giới hạn domain).

## Việc CÒN THIẾU trước khi coi là "Sprint 0 hoàn tất" (theo Gate G2 — MVP Ready)

Đây là scaffold kỹ thuật, **chưa đạt Gate G2**. Còn thiếu:

1. **IAM thật**: hiện mới có bảng `users`/`profile` đơn giản — chưa có Keycloak/OIDC,
   chưa có VNeID adapter (D06), chưa có RBAC/ABAC thực thi qua guard.
2. **Track Registry**: mới có CRUD đọc — chưa có publish maker-checker (FR-TRK-05),
   chưa có `ExamProgram` được publish thật cho AI-HE (bảng đang trống, cần tạo qua
   Bước 04-06 — thiết kế blueprint/bank/rubric trước).
3. **CI/CD, DEV-TEST-UAT** (Bước 07 yêu cầu) — chưa có.
4. **RLS policy chi tiết** — mới `enable row level security`, chưa viết policy theo
   tenant_id/JWT claim (cần khi có Keycloak).
5. **Test tự động, ADR, threat model, coding standard** — chưa có (Bước 07 gate).

## Việc cần chị quyết định tiếp

- Có muốn em tạo luôn `exam_program` + `exam_event` mẫu cho AI-HE để test end-to-end
  luồng đăng ký (DRAFT → ELIGIBLE → SCHEDULED) không?
- Có muốn em đẩy code này lên GitHub repo của chị và deploy backend lên Railway
  (đã kết nối) để có API endpoint thật, không chỉ chạy local?
