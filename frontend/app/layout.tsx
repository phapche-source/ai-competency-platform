export const metadata = {
  title: 'Nền tảng Đánh giá Năng lực AI',
  description: 'AI-HE / AI-GV / AI-VET / AI-GVET',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#f6f7f9' }}>
        {children}
      </body>
    </html>
  );
}
