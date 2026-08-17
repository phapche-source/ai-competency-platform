'use client';

import { useEffect, useState } from 'react';
import { api, Track } from '../lib/api';

// BR-J01: Người dùng đọc điều kiện và chọn AI-HE/GV/VET/GVET; hệ thống khóa route_code cho registration.
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export default function TrackSelectionPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!TENANT_ID) return;
    api.listTracks(TENANT_ID).then(setTracks).catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: '48px auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Chọn tuyến đánh giá năng lực AI</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Sau khi chọn, hệ thống sẽ khóa tuyến cho hồ sơ đăng ký của bạn (không đổi tuyến sau khi mở đề).
      </p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {!TENANT_ID && <p style={{ color: '#a60' }}>Thiếu NEXT_PUBLIC_TENANT_ID trong .env — xem README.</p>}
      <div style={{ display: 'grid', gap: 12 }}>
        {tracks.map((t) => (
          <a
            key={t.id}
            href={`/register?trackId=${t.id}&trackCode=${t.code}`}
            style={{
              display: 'block',
              padding: 16,
              borderRadius: 8,
              background: '#fff',
              border: '1px solid #e2e2e2',
              textDecoration: 'none',
              color: '#111',
            }}
          >
            <strong>{t.code}</strong> — {t.name}
            <div style={{ fontSize: 12, color: '#888' }}>Trạng thái: {t.status}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
