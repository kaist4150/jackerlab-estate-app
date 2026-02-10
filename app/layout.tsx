import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { AdSenseScript, AdBannerBottom } from "@/components/ads";
import { GoogleAnalytics, SiteVerification } from "@/components/analytics";

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
    default: "Estate - 부동산 정보",
    template: "%s | JackerLab Estate",
  },
  description: "아파트 실거래가, 시세 현황, 가격 추이, 청약 정보 등 부동산 정보를 한눈에",
  keywords: ["부동산", "아파트", "실거래가", "시세", "청약", "전세", "매매"],
  authors: [{ name: "JackerLab" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "JackerLab Estate",
    title: "Estate - 부동산 정보",
    description: "부동산 정보를 한눈에",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estate - 부동산 정보",
    description: "부동산 정보를 한눈에",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <GoogleAnalytics />
        <AdSenseScript />
        <SiteVerification />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 min-w-0 w-0 p-6 lg:p-8 pt-20 lg:pt-8 bg-gray-50 overflow-hidden" style={{ contain: 'layout' }}>
            <div className="max-w-full">
              {children}
            </div>
            <div className="mt-8 overflow-hidden" style={{ contain: 'inline-size' }}>
              <AdBannerBottom slot="9727264203" />
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
