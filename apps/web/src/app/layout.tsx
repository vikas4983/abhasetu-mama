import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ABHA SETU - Digital Health Bridge",
  description: "ABDM-ready healthcare platform for ABHA workflows, telemedicine, QR scanning, connected facilities, and secure healthcare dashboards.",
  openGraph: {
    title: "ABHA SETU - Digital Health Bridge",
    description: "ABDM-ready healthcare platform for ABHA workflows, telemedicine, QR scanning, and connected facilities.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
