import type { Metadata } from 'next';
import Script from 'next/script';
import '../styles/globals.css';
import { ThemeProvider } from '../providers/ThemeProvider';
import { AccessibilityProvider } from '../providers/AccessibilityProvider';
import { LanguageProvider } from '../providers/LanguageProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { AuthProvider } from '../providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Abha Setu - National Digital Health Bridge',
  description: 'Abha Setu - An ABDM-ready, national digital health bridge for seamless Ayushman Bharat patient journeys, instant HFR hospital queue registrations, secure e-prescriptions locker, and virtual telemedicine consultations.',
  keywords: 'ABDM, ABHA Card, Ayushman Bharat, Digital Health Locker, HFR Hospital check-in, Telemedicine India, Health ATM, Vitals Sync, Organ Pledge, Blood Bank, India Digital Health, HIPAA Secure',
  authors: [{ name: 'ABHA Setu Consortium' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://abhasetu.com/',
  },
  openGraph: {
    type: 'website',
    url: 'https://abhasetu.com/',
    title: 'Abha Setu - ABDM-Ready National Digital Health Bridge',
    description: 'Connect physical clinics with digital records under Ayushman Bharat Digital Mission guidelines. Experience instant check-in, oximeter-sync health dashboard, and secure e-prescriptions.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Abha Setu - National Digital Health Bridge',
      },
    ],
    siteName: 'ABHA SETU',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AbhaSetuBridge',
    creator: '@AbhaSetuBridge',
    title: 'Abha Setu - ABDM-Ready National Digital Health Bridge',
    description: 'Connect physical clinics with digital records under Ayushman Bharat Digital Mission guidelines. Experience instant check-in, oximeter-sync health dashboard, and secure e-prescriptions.',
    images: ['https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Search Structured Data (JSON-LD) for Rich Sitelinks & Searchbox */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://abhasetu.com/#website",
                  "url": "https://abhasetu.com/",
                  "name": "Abha Setu - National Digital Health Bridge",
                  "alternateName": "ABHA SETU",
                  "description": "National Digital Health Bridge linking physical clinics with digital healthcare records under ABDM guidelines.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://abhasetu.com/?search={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SiteNavigationElement",
                  "@id": "https://abhasetu.com/#navigation",
                  "name": [
                    "Scan QR",
                    "ABHA Card",
                    "Health Locker",
                    "Book Consultation",
                    "Health ATM"
                  ],
                  "url": [
                    "https://abhasetu.com/#/qr-scanner",
                    "https://abhasetu.com/#/abha",
                    "https://abhasetu.com/#/records",
                    "https://abhasetu.com/#/telemedicine",
                    "https://abhasetu.com/#/health-atm"
                  ]
                }
              ]
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Synchronous script to immediately set client preferences and prevent flicker */}
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const state = JSON.parse(localStorage.getItem("setu_state") || "{}");
                  if (state.theme && state.theme !== "dark-teal") {
                    document.body.classList.add('theme-' + state.theme);
                  }
                  if (state.accessibility) {
                    if (state.accessibility.largeFont) document.body.classList.add('accessibility-large-font');
                    if (state.accessibility.highContrast) document.body.classList.add('accessibility-high-contrast');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <QueryProvider>
          <LanguageProvider>
            <ThemeProvider>
              <AccessibilityProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </AccessibilityProvider>
            </ThemeProvider>
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
