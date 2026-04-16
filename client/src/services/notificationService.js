// Notification Service
export const notificationService = {
  // Check if notifications are enabled and supported
  isEnabled: () => {
    return (
      "Notification" in window &&
      Notification.permission === "granted" &&
      localStorage.getItem("notificationsEnabled") === "true"
    );
  },

  // Send a notification
  send: (title, options = {}) => {
    if (notificationService.isEnabled()) {
      try {
        new Notification(title, {
          icon: "/icon.png",
          ...options
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  },

  // Order placed notification
  orderPlaced: (orderId) => {
    notificationService.send("Order Placed! 🎉", {
      body: `Your order #${orderId} has been confirmed. Tracking your delivery...`,
      tag: `order-${orderId}`,
    });
  },

  // Order out for delivery notification
  orderOutForDelivery: (orderId) => {
    notificationService.send("Order Out for Delivery! 🚗", {
      body: `Your order #${orderId} is on its way to you!`,
      tag: `order-${orderId}`,
    });
  },

  // Order delivered notification
  orderDelivered: (orderId) => {
    notificationService.send("Order Delivered! ✅", {
      body: `Your order #${orderId} has been delivered successfully!`,
      tag: `order-${orderId}`,
    });
  },

  // Payment confirmation notification
  paymentConfirmed: (amount) => {
    notificationService.send("Payment Confirmed! 💰", {
      body: `Your payment of KSh ${amount} has been processed successfully.`,
    });
  },

  // Custom notification
  custom: (title, message) => {
    notificationService.send(title, {
      body: message,
    });
  },
};

export default notificationService;
