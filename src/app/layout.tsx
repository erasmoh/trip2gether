import type { Metadata } from "next";
import { Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";

// Friendly rounded sans-serif for everything (headings + body).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Kept for tabular/technical bits: times, codes, URLs.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trip2gether — planea viajes en grupo",
  description:
    "Organiza el itinerario de tu viaje en grupo: agenda por día, actividades con hora y descripción, comentarios y permisos por invitado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-6">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
