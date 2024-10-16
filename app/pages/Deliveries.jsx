import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { auth } from "../../Backend/firebase";

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const route = useRoute();
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

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
    const fetchDeliveries = async () => {
      console.log("Fetching deliveries for rider_id: ", user?.user_id);
      try {
        const response = await axios.get(
          `https://backend-rho-three-58.vercel.app/deliveries/${user?.user_id}`
        );
        setDeliveries(response.data);
        console.log("Deliveries: ", deliveries[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [user?.user_id]);

  const handleStatusChange = async (deliveryId, newStatus) => {
    try {
      await fetch(
        `https://backend-rho-three-58.vercel.app/delivery-status/${deliveryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            delivery_status: newStatus,
            is_delivered_to_buyer: newStatus === "Delivered",
          }),
        }
      );
      // Update local state
      setDeliveries((prevDeliveries) =>
        prevDeliveries.map((delivery) =>
          delivery.delivery_id === deliveryId
            ? { ...delivery, delivery_status: newStatus }
            : delivery
        )
      );
      Alert.alert("Success", `Status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert("Error", "Failed to update delivery status");
    }
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
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Deliveries</Text>
      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.delivery_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.deliveryId}>
              Delivery ID: {item.delivery_id}
            </Text>
            <Text style={styles.detail}>Order ID: {item.order_id}</Text>
            <Text style={styles.detail}>Buyer Name: {item.buyer_name}</Text>
            <Text style={styles.detail}>Order Date: {item.order_date}</Text>
            <Text style={styles.detail}>From: {item.seller_address}</Text>
            <Text style={styles.detail}>To: {item.buyer_address}</Text>

            <Picker
              selectedValue={item.delivery_status}
              onValueChange={(value) =>
                handleStatusChange(item.delivery_id, value)
              }
              style={styles.picker}
            >
              <Picker.Item
                label="Delivery Processing"
                value="Delivery Processing"
              />
              <Picker.Item label="Delivery Shipped" value="Delivery Shipped" />
              <Picker.Item label="Delivered" value="Delivered" />
            </Picker>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4EA",
    padding: 20,
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
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  deliveryId: {
    fontWeight: "bold",
    fontSize: 16,
  },
  detail: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    marginVertical: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
});

export default Deliveries;
