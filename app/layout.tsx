import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_SC, ZCOOL_KuaiLe } from "next/font/google";
import { AppProvider } from "@/components/app-provider";
import { Shell } from "@/components/shell";
import "./globals.css";

const display = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

const body = Noto_Sans_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "烟酒生",
  description: "记下每天的烟和酒。",
  applicationName: "烟酒生",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ff5a36",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-[#e7d3c4] text-foreground">
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
