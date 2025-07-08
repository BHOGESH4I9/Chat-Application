import { messaging } from "../firebase/config";
import { getToken } from "firebase/messaging";

export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY_FROM_FIREBASE_SETTINGS",
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("Notification permission denied.");
    }
  } catch (err) {
    console.error("Error getting notification permission:", err);
  }
};
