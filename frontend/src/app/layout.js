import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'RetinaAI | Professional AI-Powered Video Interview Platform',
  description: 'Proctor-safe, speech-to-text automated video interviews. Scale recruitment with candidate intelligence metrics, automated transcripts, and scoring.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full bg-dark-bg text-gray-100 flex flex-col antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
