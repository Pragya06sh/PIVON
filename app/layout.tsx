import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "PIVON — Lead Response System for Real Estate Builders | Indore",
  description:
    "PIVON sets up and manages complete lead response systems for real estate builders in Indore. Instant WhatsApp replies, AI qualification, automated follow-ups — every enquiry answered in 60 seconds, 24/7. Start your ₹999 trial today.",
  metadataBase: new URL("https://pivon.agency"),
  keywords: [
    "real estate lead management",
    "Indore builder automation",
    "WhatsApp lead response",
    "AI lead qualification",
    "real estate CRM Indore",
    "property lead automation",
    "builder sales automation",
    "PIVON agency",
  ],
  openGraph: {
    title: "PIVON — Lead Response System for Indore Real Estate Builders",
    description:
      "Every enquiry answered in 60 seconds, 24/7. Instant WhatsApp response, AI qualification, automated follow-ups. Stop losing leads to slow follow-up.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body">
        <AuthProvider>
          <div className="grain-overlay" aria-hidden />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
