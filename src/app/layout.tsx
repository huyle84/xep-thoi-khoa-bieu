import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/lib/auth';


export const metadata: Metadata = {
  title: "TKB Manager",
  description: "Phần mềm quản lý thời khóa biểu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="vi">
      <body >
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
