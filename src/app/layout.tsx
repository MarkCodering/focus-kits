import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
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
  const cookieStore = cookies();
  const savedTheme = cookieStore.get("fk-theme")?.value;
  const htmlClass = savedTheme === "dark" ? "dark" : undefined;
  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
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
              // Persist effective theme for SSR alignment on next load
              document.cookie = 'fk-theme=' + (dark ? 'dark' : 'light') + '; Max-Age=31536000; Path=/';
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
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
