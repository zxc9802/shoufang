import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealState AI - 房产文案大师",
  description: "AI 驱动的房产文案生成工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
