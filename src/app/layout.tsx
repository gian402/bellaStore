import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'BellaStore - Encuentra productos únicos para resaltar tu estilo',
    template: '%s | BellaStore',
  },
  description:
    'Tienda online de perfumes, carteras, accesorios y más. Productos exclusivos para mujer con entrega en Honduras.',
  keywords: ['tienda online', 'perfumes', 'carteras', 'accesorios', 'Honduras', 'moda femenina'],
  authors: [{ name: 'BellaStore' }],
  openGraph: {
    type: 'website',
    locale: 'es_HN',
    siteName: 'BellaStore',
    title: 'BellaStore - Productos únicos para resaltar tu estilo',
    description: 'Perfumes, carteras, accesorios y más. Compra online fácil y segura.',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f43f5e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              border: '1px solid #fce7f3',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}
