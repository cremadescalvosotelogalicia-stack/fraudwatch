import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FraudWatch — Organízate contra el fraude",
  description:
    "Plataforma para víctimas de fraude y estafas. Organízate colectivamente, aporta pruebas y ejerce tus derechos con garantías RGPD.",
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
