import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Kits",
  description: "A Next.js template with shadcn/ui components for building beautiful applications",
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
