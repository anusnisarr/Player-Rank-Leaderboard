import "./globals.css";
import { Toaster } from "react-hot-toast";
import { PlaygroundProvider } from "@/context/PlaygroundContext";
export const metadata = {
  title: "RANKIFY",
  description: "Track your game stats and rankings",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RANKIFY",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF4655",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#FF4655" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CS2 Ranks" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" />
      </head>
      <body style={{ margin: 0, background: "#0A0A0B", color: "#E8E8F0", minHeight: "100vh" }}>
        <PlaygroundProvider>
          <main style={{ paddingTop: 56 }}>
            {children}
          </main>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: { background: "#111113", color: "#E8E8F0", border: "1px solid #1E1E22", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", maxWidth: "90vw" },
              success: { iconTheme: { primary: "#FF4655", secondary: "#0A0A0B" } },
              error:   { iconTheme: { primary: "#FF4655", secondary: "#0A0A0B" } },
            }}
          />
        </PlaygroundProvider>
      </body>
    </html>
  );
}
