import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// Set notification handler to show notifications even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register the device for push notifications
export async function registerForPushNotifications() {
  let token;

  // Check if running on a physical device
  if (Device.isDevice) {
    // Get current permissions status
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    console.log("Existing Permission Status:", existingStatus);

    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Handle permission denial
    if (finalStatus !== "granted") {
      alert("Failed to get push token for notifications!");
      return;
    }

    // Get Expo Push Token
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);

    // Set Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }
  } else {
    alert("Must use a physical device for Push Notifications");
  }

  return token;
}
