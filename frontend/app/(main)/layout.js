import Navbar from "@/components/Navbar";
import PushNotifications from "@/components/PushNotifications";
import { PlaygroundProvider } from "@/context/PlaygroundContext";
import { UserProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <>
    <UserProvider>
      <PlaygroundProvider>
        <PushNotifications />
      <Navbar />
      {children}
      </PlaygroundProvider>
    </UserProvider>
    </>
  );
}
