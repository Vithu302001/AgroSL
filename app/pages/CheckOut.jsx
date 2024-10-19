import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";
import colors from "../../constants/colors";
import { auth } from "../../Backend/firebase";
import image from "../../assets/images/creditCardImage.jpg";
import { registerForPushNotifications } from "../../Backend/notification";
import { useRoute, useNavigation } from "@react-navigation/native";

const CheckoutPage = () => {
  const [user_id, setUser_id] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const expoPushToken = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();

  // Register for notifications and fetch current user on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser_id(currentUser?.uid);
    });

    registerForPushNotifications().then((token) => {
      expoPushToken.current = token;
    });

    return () => unsubscribe();
  }, []);

  const handleCheckout = () => {
    if (user_id) {
      const paymentUrl = `https://agro-sl.vercel.app/mobile_checkout/${user_id}`;
      setPaymentUrl(paymentUrl);
      setShowWebView(true);
      setLoading(true);
    } else {
      Alert.alert("Error", "User not found. Please log in.");
    }
  };

  //check the web view url change and decide further action  based on the url
  const handleNavigationStateChange = (navState) => {
    const successUrl = "https://agro-sl.vercel.app/Success";
    const errorUrl = "https://agro-sl.vercel.app/error";

    if (navState.url.includes(successUrl)) {
      sendSuccessNotification();
      setShowWebView(false);
      route.params?.onPaymentSuccess();
      navigation.navigate("Home");
    } else if (navState.url.includes(errorUrl)) {
      Alert.alert("Error", "Payment failed. Please try again.");
      setShowWebView(false);
      navigation.navigate("Home");
    }
  };

  const sendSuccessNotification = async () => {
    if (expoPushToken.current) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Payment Successful 🎉",
          body: "Thank you for your purchase! Your order is being processed.",
        },
        trigger: null, // Send immediately
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      {!showWebView ? (
        <TouchableOpacity style={styles.button} onPress={handleCheckout}>
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      ) : (
        <WebView
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          style={styles.webView}
          onLoadEnd={() => setLoading(false)}
        />
      )}

      <Image source={image} style={styles.image} />

      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.seaGreen}
          style={styles.loadingIndicator}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    width: "auto",
    gap: 5,
  },
  image: {
    width: 350,
    height: 100,
    margin: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    marginLeft: "32%",
  },
  button: {
    padding: 20,
    fontSize: 30,
    backgroundColor: colors.forestGreen,
    borderRadius: 100,
    width: 300,
    marginLeft: "12%",
  },
  buttonText: {
    color: "white",
    alignSelf: "center",
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "56%",
    zIndex: 1,
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  webView: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default CheckoutPage;
