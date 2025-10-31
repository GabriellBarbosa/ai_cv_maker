import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Build your resume with AI",
  description: "Generate professional resumes and cover letters using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
