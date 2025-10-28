// app/layout.tsx

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import GlobalChatbot from '../../components/common/GlobalChatbot';
import { AuthProvider } from './context/AuthContext'; // Import the provider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Automobile Service Center', // Updated title
  description: 'Manage your vehicle services',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap everything in the AuthProvider */}
        <AuthProvider>
          {children}
          <GlobalChatbot />
        </AuthProvider>
      </body>
    </html>
  );
}