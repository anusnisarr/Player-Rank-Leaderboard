import Navbar from "@/components/Navbar";
import PushNotifications from "@/components/PushNotifications";

export default function RootLayout({ children }) {
  return (
    <>
      <PushNotifications />
      <Navbar />
      {children}
    </>
  );
}