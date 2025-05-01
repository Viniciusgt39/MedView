import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Import Inter font
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }); // Define Inter font variable

export const metadata: Metadata = {
  title: 'MediView Desktop',
  description: 'Patient Management Dashboard',
  manifest: '/manifest.ts' // Add manifest
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR"> {/* Set language to Portuguese */}
      <body className={`${inter.variable} font-sans antialiased`}> {/* Use Inter font */}
        <AppLayout>{children}</AppLayout>
        <Toaster /> {/* Add Toaster for notifications */}
      </body>
    </html>
  );
}
