import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Arena Compare — 模型能力横向对比",
  description: "Compare selected models from the public Arena Text and Code leaderboards with favorites, visual charts, dark mode, and shareable URLs.",
  metadataBase: new URL("https://llm-arena-compare.vercel.app"),
  openGraph: {
    title: "LLM Arena Compare",
    description: "一站式对比 Arena 文本/Code 榜单模型：分数、排名、票数、价格横向可视化。",
    url: "https://llm-arena-compare.vercel.app",
    siteName: "LLM Arena Compare",
    images: [{ url: "/preview.png", width: 1200, height: 630 }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "LLM Arena Compare",
    description: "一站式对比 Arena 文本/Code 榜单模型。",
    images: ["/preview.png"]
  },
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('llm-arena-compare:theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
