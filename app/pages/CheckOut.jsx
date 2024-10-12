import React, { useState, useEffect } from "react";
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
import colors from "../../constants/colors";
import { auth } from "../../Backend/firebase"; // Ensure this is your Firebase auth setup
import image from "../../assets/images/Credit_Card_Payment.png";

const CheckoutPage = ({ navigation }) => {
  const [user_id, setUser_id] = useState(null);
  const [loading, setLoading] = useState(false); // State to manage loading spinner
  const [showWebView, setShowWebView] = useState(false); // State to control WebView visibility
  const [paymentUrl, setPaymentUrl] = useState(""); // State to hold the payment URL

  // Fetch current user on component mount using onAuthStateChanged
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser_id(currentUser?.uid);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle checkout button press
  const handleCheckout = () => {
    if (user_id) {
      // Construct the payment URL with user info
      const paymentUrl = `https://agro-sl.vercel.app/mobile_checkout/${user_id}`;
      setPaymentUrl(paymentUrl); // Set the payment URL
      setShowWebView(true); // Show the WebView
      setLoading(true); // Show loading spinner
    } else {
      Alert.alert("Error", "User not found. Please log in.");
    }
  };

  const handleNavigationStateChange = (navState) => {
    const successUrl = "https://agro-sl.vercel.app/Success";
    const errorUrl = "https://agro-sl.vercel.app/error";

    // Check if the URL is the success or error URL
    if (navState.url.includes(successUrl)) {
      setShowWebView(false); // Hide the WebView
      navigation.navigate("Home");
    } else if (navState.url.includes(errorUrl)) {
      Alert.alert("Error", "Payment failed. Please try again.");
      setShowWebView(false); // Hide the WebView
      navigation.navigate("Home");
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
          onLoadEnd={() => setLoading(false)} // Hide loading when page loads
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
    left: "50%",
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
