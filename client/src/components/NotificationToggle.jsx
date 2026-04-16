import { useState, useEffect } from "react";

const NotificationToggle = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if browser supports notifications
    const supported = "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      // Check saved preference and current permission
      const savedPref = localStorage.getItem("notificationsEnabled") === "true";
      setNotificationsEnabled(
        savedPref && Notification.permission === "granted"
      );
    }
  }, []);

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      alert("Your browser does not support notifications");
      return;
    }

    if (!notificationsEnabled) {
      // Request permission
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
        localStorage.setItem("notificationsEnabled", "true");
        sendTestNotification();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setNotificationsEnabled(true);
            localStorage.setItem("notificationsEnabled", "true");
            sendTestNotification();
          }
        });
      } else {
        alert("Notifications are blocked. Please enable them in browser settings.");
      }
    } else {
      // Disable notifications
      setNotificationsEnabled(false);
      localStorage.setItem("notificationsEnabled", "false");
    }
  };

  const sendTestNotification = () => {
    if (isSupported && Notification.permission === "granted") {
      new Notification("FoodDelivery Notifications", {
        body: "You will now receive order updates!",
        icon: "/icon.png",
      });
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={handleNotificationToggle}
      className={`notification-toggle px-3 py-2 rounded-lg font-semibold transition ${
        notificationsEnabled
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-gray-300 text-gray-700 hover:bg-gray-400"
      }`}
      title={
        notificationsEnabled
          ? "Notifications enabled"
          : "Click to enable notifications"
      }
    >
      🔔 {notificationsEnabled ? "On" : "Off"}
    </button>
  );
};

export default NotificationToggle;
