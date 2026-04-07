import webpush  from "web-push";
import PushSubscription from "../models/PushSubscription.js";


webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// POST /api/notifications/subscribe
// Frontend calls this to save the subscription
export const subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys) return res.status(400).json({ success: false, error: "Invalid subscription" });

    // Save or update
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/notifications/send
// Call this internally whenever you want to notify everyone
export const sendPushToAll = async (title, body, url = "/") => {
  const subscriptions = await PushSubscription.find();
  const payload = JSON.stringify({ title, body, url, icon: "/icon-192.png" });

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification({
        endpoint: sub.endpoint,
        keys:     { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      }, payload)
    )
  );

  // Remove dead subscriptions (user uninstalled app etc)
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      PushSubscription.findOneAndDelete({ endpoint: subscriptions[i].endpoint });
    }
  });
}

export const sendNotification = async (req, res) => {
  const { title, body, url } = req.body;
  try {
    await sendPushToAll(title, body, url);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export const testNotification = async (req, res) => {
    try {
    await sendPushToAll(
      "Test Notification",
      "Push notifications are working!",
      "/"
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}