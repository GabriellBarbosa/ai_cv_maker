import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI CV Maker",
  description: "Generate professional resumes and cover letters using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
