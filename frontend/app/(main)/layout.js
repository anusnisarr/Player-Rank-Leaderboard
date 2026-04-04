import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import PushNotifications from "@/components/PushNotifications";


export const metadata = {
  title: "CS2 Rank Tracker",
  description: "Track your friend group CS2 stats and rankings",
  manifest: "/manifest.webmanifest",
  themeColor: "#FF4655",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CS2 Ranks",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <PushNotifications />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: "#111113", color: "#E8E8F0", border: "1px solid #1E1E22", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", maxWidth: "90vw" },
            success: { iconTheme: { primary: "#FF4655", secondary: "#0A0A0B" } },
            error: { iconTheme: { primary: "#FF4655", secondary: "#0A0A0B" } },
          }}
        />
      </body>
    </html>
  );
}
