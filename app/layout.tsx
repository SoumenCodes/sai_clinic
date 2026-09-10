import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sai Homoeo Clinic | Dr. S. K. Sharma (B.H.M.S) | Baridih, Jamshedpur",
  description:
    "Trusted Classical Homoeopathic Clinic in Baridih, Jamshedpur. Effective, safe, and natural treatment for chronic diseases, skin, hair, allergies, kidney stones & arthritis. Near Ramni Kali Mandir.",
  keywords: [
    "Sai Homoeo Clinic",
    "Homeopathy doctor Baridih Jamshedpur",
    "Homoeopathic clinic near Ramni Kali Mandir",
    "Best homeopath in Jamshedpur",
    "Skin treatment homeopathy Jamshedpur",
    "Kidney stone homeopathy cure",
    "Chronic disease homeopathy Baridih",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f5132",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
