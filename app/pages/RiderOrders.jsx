import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth } from "../../Backend/firebase";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications } from "../../Backend/notification";

const Rider_Orders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const expoPushToken = useRef(null);

  // Fetch the user from Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        axios
          .get(
            `https://backend-rho-three-58.vercel.app/users/${currentUser.uid}`
          )
          .then((res) => {
            setUser(res.data);
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      expoPushToken.current = token;
    });
  }, []);

  // Fetch orders where sent_to_delivery is true
  useEffect(() => {
    if (user) {
      axios
        .get(`https://backend-rho-three-58.vercel.app/orders`)
        .then((res) => {
          setOrders(res.data.length ? res.data : []);
        })
        .catch((err) => {
          setError(
            err.response?.status === 404 ? "No orders found." : err.message
          );
        });
    }
  }, [user]);

  const sendSuccessNotification = async (orderId) => {
    if (expoPushToken.current) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Order successfully taken",
          body: `${orderId} has been successfully taken by you.`,
        },
        trigger: null, // Send immediately
      });
    }
  };

  // Handle 'Take It' button click
  const handleTakeOrder = (orderId) => {
    const deliveryData = {
      order_id: orderId,
      delivery_rider_id: user.user_id,
      is_delivered_to_buyer: false,
    };

    axios
      .post(`https://backend-rho-three-58.vercel.app/deliveries`, {
        deliveryData,
      })
      .then(() => {
        axios.put(`https://backend-rho-three-58.vercel.app/orders/${orderId}`, {
          deliver_took: true,
        });
        sendSuccessNotification(orderId);
      })
      .then(() => {
        setOrders(orders.filter((order) => order.order_id !== orderId));
      })
      .catch((err) => Alert.alert("Error", err.message));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>No user logged in</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Available Orders for Delivery</Text>
      {orders.length === 0 ? (
        <Text style={styles.noOrders}>No orders available for delivery</Text>
      ) : (
        (console.log(orders[0]),
        orders.map((order) => (
          <View key={order.order_id} style={styles.card}>
            <Text style={styles.orderId}>Order ID: {order.order_id}</Text>
            <Text style={styles.detail}>Seller Name: {order.seller_id}</Text>
            <Text style={styles.detail}>Buyer Name: {order.buyer_id}</Text>
            <Text style={styles.detail}>From: {order.seller_address}</Text>
            <Text style={styles.detail}>To: {order.buyer_address}</Text>
            <Button
              title="Take It"
              onPress={() => handleTakeOrder(order.order_id)}
              color="#4CAF50"
            />
          </View>
        )))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  noOrders: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
});

export default Rider_Orders;
