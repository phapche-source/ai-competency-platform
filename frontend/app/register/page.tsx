'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

// BR-J02 (hồ sơ) -> BR-J03 (đủ điều kiện) -> BR-J04 (đặt lịch)
export default function RegisterPage() {
  const params = useSearchParams();
  const trackId = params.get('trackId') ?? '';
  const trackCode = params.get('trackCode') ?? '';

  const [step, setStep] = useState<'profile' | 'done'>('profile');
  const [form, setForm] = useState({ email: '', fullName: '', dateOfBirth: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user: any = await api.createProfile({
        tenantId: TENANT_ID,
        email: form.email,
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth || undefined,
      });

      // MVP: cần examProgramId thật (mở qua Track Registry/Exam Program đã publish).
      // Ở đây minh hoạ luồng — trong triển khai thật, chọn program_version đang mở của track.
      const registration: any = await api.createRegistration({
        tenantId: TENANT_ID,
        personProfileId: user.profile.id,
        trackId,
        examProgramId: params.get('examProgramId') ?? '',
      });

      setRegistrationId(registration.id);
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '48px auto', padding: 24 }}>
      <h1 style={{ fontSize: 22 }}>Đăng ký tuyến {trackCode}</h1>

      {step === 'profile' && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
          <input
            required
            placeholder="Họ và tên"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            style={inputStyle}
          />
          <input
            required
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            style={inputStyle}
          />
          {error && <p style={{ color: 'crimson' }}>{error}</p>}
          <button disabled={submitting} type="submit" style={buttonStyle}>
            {submitting ? 'Đang gửi...' : 'Tạo hồ sơ & đăng ký'}
          </button>
        </form>
      )}

      {step === 'done' && (
        <div style={{ marginTop: 16 }}>
          <p>Đã tạo đăng ký thành công. Mã đăng ký: <code>{registrationId}</code></p>
          <p style={{ color: '#555' }}>Trạng thái: DRAFT — bước tiếp theo là kiểm tra điều kiện dự thi (BR-J03) và đặt lịch (BR-J04).</p>
        </div>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: 6, border: '1px solid #ccc' };
const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 6,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
};
