import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: "TKB Manager",
  description: "Phần mềm quản lý thời khóa biểu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
