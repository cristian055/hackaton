import type {Metadata} from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Comfama | Documentos',
  description: 'Gestión documental Comfama',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className={roboto.variable}>
      <body suppressHydrationWarning className="font-sans antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}