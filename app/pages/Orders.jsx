import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import colors from "../../constants/colors";

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [buyerId, setBuyerId] = useState(null); // State for buyer ID
  const navigation = useNavigation(); // Initialize useNavigation hook
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const auth = getAuth(); // Get the Auth instance

    // Monitor auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, set buyer ID
        setBuyerId(user.uid);
      } else {
        // User is signed out
        setBuyerId(null);
        setOrders([]); // Clear orders on logout
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!buyerId) return; // Wait until we have buyerId
      console.log("Fetching orders for buyer_id: ", buyerId);
      try {
        const response = await axios.get(
          `https://backend-rho-three-58.vercel.app/api/orders_for_buyers/${buyerId}`
        );

        const data = response.data;

        // Filter orders where sent_to_delivery is true
        const filteredData = data.filter((order) => order.sent_to_delivery);
        console.log("Filtered orders: ", filteredData);

        // Fetch item images for each order
        const ordersWithImages = await Promise.all(
          filteredData.map(async (order) => {
            try {
              const itemResponse = await axios.get(
                `https://backend-rho-three-58.vercel.app/items/${order.item_id}`
              );
              const itemData = itemResponse.data[0];
              return { ...order, item_image: itemData.image_url };
              // Set loading to false after fetching
            } catch (error) {
              console.error(
                `Error fetching image for item ${order.item_id}:`,
                error
              );
              return { ...order, item_image: null }; // Return null if image is not found
            }
          })
        );

        // Sort by order_id
        ordersWithImages.sort((a, b) => b.order_id.localeCompare(a.order_id));

        setOrders(ordersWithImages);
        setLoading(false);
        console.log(ordersWithImages);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    if (buyerId) {
      fetchOrders();
    }
  }, [buyerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.darkGreen} />
        <Text>Loading delivery data...</Text>
      </View>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format date as MM/DD/YYYY
  };

  const handleComplain = (order) => {
    // Navigate to the complaint page, passing order_id and seller_id
    navigation.navigate("Complaint", {
      order_id: order.order_id,
      seller_id: order.seller_id,
    });
  };

  const handleTrackOrder = (order) => {
    // Navigate to the Tracking page, passing order_id
    navigation.navigate("Tracking", {
      orderID: order.order_id,
    });
  };

  const renderOrderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        {item.item_image && (
          <Image source={{ uri: item.item_image }} style={styles.itemImage} />
        )}
        <Text style={styles.orderId}>Order ID: {item.order_id}</Text>
        <Text style={styles.detail}>Seller ID: {item.seller_id}</Text>
        <Text style={styles.detail}>Item ID: {item.item_id}</Text>
        <Text style={styles.detail}>
          Order Date: {formatDate(item.order_date)}
        </Text>
        <Text style={styles.detail}>Quantity: {item.order_quantity}</Text>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => handleTrackOrder(item)}
        >
          <Text style={styles.trackButtonText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.complainButton}
          onPress={() => handleComplain(item)}
        >
          <Text style={styles.complainButtonText}>Complain</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Orders on Delivery</Text>
      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>No orders found</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.order_id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E6F4EA",
  },
  header: {
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  orderId: {
    fontWeight: "bold",
    color: "#333",
  },
  detail: {
    fontSize: 14,
    color: "#777",
    marginVertical: 2,
  },
  trackButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2196F3", // Blue theme for tracking
    borderRadius: 4,
    alignItems: "center",
  },
  trackButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  complainButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#4CAF50", // Green theme
    borderRadius: 4,
    alignItems: "center",
  },
  complainButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  list: {
    paddingBottom: 20,
  },
  noOrdersText: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BuyerOrders;
