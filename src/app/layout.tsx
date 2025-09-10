import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Kits",
  description: "A Next.js template with shadcn/ui components for building beautiful applications",
  // Ensure browser UI theme color matches light/dark backgrounds
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(0 0% 100%)" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(0 0% 3.9%)" },
  ],
};

// Mobile-friendly viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
          (function(){
            try{
              var KEY = 'adhd-focus-theme-v3';
              var m = localStorage.getItem(KEY) || 'light';
              var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              var dark = m === 'dark' || (m === 'system' && prefersDark);
              var root = document.documentElement;
              if (dark) root.classList.add('dark'); else root.classList.remove('dark');
            }catch(e){}
          })();
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
