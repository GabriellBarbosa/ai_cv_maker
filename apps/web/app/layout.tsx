import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gere seu com currículo usando IA",
  description:
    "Tenha em mãos um currículo e uma carta de apresentação adequados com o seu perfil e a descrição da vaga",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
