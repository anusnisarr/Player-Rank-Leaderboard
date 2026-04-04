"use client";
import { useEffect } from "react";
import api from "@/lib/api";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushNotifications() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const setup = async () => {
      try {
        // Register service worker
        const registration = await navigator.serviceWorker.register("/serviceWorker.js");

        // Ask permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
        });

        // Save subscription to backend
        await api.post("/notifications/subscribe", subscription);

        console.log("✅ Push notifications enabled");
      } catch (err) {
        console.log("Push setup failed:", err.message);
      }
    };

    // Small delay so page loads first
    setTimeout(setup, 3000);
  }, []);

  return null;
}