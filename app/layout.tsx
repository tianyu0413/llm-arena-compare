import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Arena Compare",
  description: "Compare selected models from the public Arena Text and Code leaderboards with favorites and visual charts."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
