import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Kits",
  description: "A beautiful focus timer app with gamification elements",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Focus Kits",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Focus Kits",
    title: "Focus Kits",
    description: "A beautiful focus timer app with gamification elements",
  },
  twitter: {
    card: "summary",
    title: "Focus Kits",
    description: "A beautiful focus timer app with gamification elements",
  },
};

// Mobile-friendly viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
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
        <Script id="sw-register" strategy="afterInteractive">
          {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
            });
          }
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
