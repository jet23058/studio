

import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { AuthProvider } from '@/context/auth-context'; // Import AuthProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '卡路里快照', // Translated title
  description: '拍張照片即可估算食物卡路里', // Translated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full">{/* Remove whitespace around body */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}> {/* Full height */}
        <AuthProvider> {/* Wrap children with AuthProvider */}
          {children}
          <Toaster /> {/* Add Toaster here */}
        </AuthProvider>
      </body>
    </html>
  );
}

