import type { Metadata } from "next";
import { Noto_Sans_JP, Sora } from "next/font/google";
import "./globals.css";
import Canvas from "@/features/canvas/Canvas";
import InitialLoading from "@/features/loading/InitialLoading";
import CustomCursor from "@/features/cursor/CustomCursor";
import RouterSync from "@/routing/RouterSync";
import TitleSync from "@/features/title/TitleSync";
import ClientDeviceSync from "@/features/client-device/ClientDeviceSync";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  description: "松田秀隆のポートフォリオサイト",
  openGraph: {
    title: "松田秀隆のポートフォリオサイト",
    description: "松田秀隆のポートフォリオサイト",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${sora.variable} ${notoSansJP.variable} antialiased`}>
        <RouterSync />
        <TitleSync />
        <ClientDeviceSync />
        <CustomCursor />
        <InitialLoading />
        <div className="fixed inset-0 z-0 bg-background">
          <Canvas />
        </div>
        <main className="relative z-10 min-h-screen pointer-events-none">
          {children}
        </main>
      </body>
    </html>
  );
}
