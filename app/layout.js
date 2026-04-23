import "./globals.css";

export const metadata = {
  title: "Spotainer",
  description: "PT 회원관리 프로그램",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
