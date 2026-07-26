import "./globals.css";

export const metadata = {
  title: "Spotainer",
  description: "여성전용 PT 일정관리",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
