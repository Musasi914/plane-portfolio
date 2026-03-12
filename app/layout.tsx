import type { Metadata } from "next";
import { Noto_Sans_JP, Sora } from "next/font/google";
import "./globals.css";
import Canvas from "@/features/canvas/Canvas";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ようこそ",
  description: "松田秀隆のポートフォリオサイト",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${sora.variable} ${notoSansJP.variable} antialiased`}>
        <div className="fixed inset-0 z-0">
          <Canvas />
        </div>
        <main className="relative z-10 min-h-screen pointer-events-none">
          {children}
        </main>
      </body>
    </html>
  );
}
