
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LanguageProvider } from '@/components/LanguageContext';
// import { SocialProof } from '@/components/SocialProof';
import { PWASetup } from '@/components/PWASetup';
import { FloatingAiChat } from '@/components/FloatingAiChat';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KTRS',
  },
  icons: {
    icon: '/1625-1.png',
    apple: '/1625-1.png',
  },
  title: 'Korea Tax Refund Service (KTRS) | 대한민국 외국인 세금 환급 서비스',
  description: '대한민국 체류 외국인을 위한 전문 세금 환급 포털입니다. 경정청구 및 소득세 감면액을 안전하게 조회하고 환급받으세요.',
  openGraph: {
    title: 'Korea Tax Refund Service (KTRS) | 대한민국 외국인 세금 환급 서비스',
    description: '대한민국 체류 외국인을 위한 전문 세금 환급 포털입니다. 경정청구 및 소득세 감면액을 안전하게 조회하고 환급받으세요.',
    images: [
      {
        url: '/1625-1.png',
        width: 1200,
        height: 630,
        alt: 'Korea Tax Refund Service Logo',
      },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30 selection:text-primary-foreground" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <Toaster />
          {/* <SocialProof /> */}
          <PWASetup />
          <FloatingAiChat />
        </LanguageProvider>
      </body>
    </html>
  );
}
