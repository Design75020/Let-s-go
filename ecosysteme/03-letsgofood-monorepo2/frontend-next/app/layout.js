import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  metadataBase: new URL('https://app.letsgofood.fr'),
  title: {
    default: "Let's Go Food — Commandez en ligne",
    template: "%s | Let's Go Food",
  },
  description: "Commandez vos repas préférés en ligne et faites-vous livrer rapidement par les meilleurs restaurants.",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://app.letsgofood.fr',
    siteName: "Let's Go Food",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
