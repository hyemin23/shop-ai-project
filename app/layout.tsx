import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "똑픽 (DDokPick)",
    template: "%s | 똑픽",
  },
  description:
    "동대문 의류 셀러를 위한 AI 이미지 편집 서비스. 의류 교체, 색상 변경, 포즈 변경을 건당 1,000원 이하, 수 분 이내로.",
  metadataBase: new URL("https://ddokpick.com"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "똑픽 (DDokPick)",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "똑픽 — AI 의류 이미지 편집 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
