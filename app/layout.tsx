import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OSIS-Hub — Pusat Kendali Organisasi Siswa",
  description:
    "Sistem manajemen OSIS terpadu: aspirasi, agenda & proker, transparansi dana, event, arsip, absensi, keuangan, dan LPJ dalam satu platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} font-body antialiased bg-bg text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
