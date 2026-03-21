import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crowd Litigations — La union es tu fuerza",
  description:
    "Plataforma de litigacion masiva. Defendemos lo que es tuyo. Reclamaciones tributarias, administrativas, de consumo y de competencia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
