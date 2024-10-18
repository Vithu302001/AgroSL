import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Button,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";
import logo from "../../assets/images/AgroSL.png";

const Tracking = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderID } = route.params; // Extract orderID from params

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryRiderDetails, setDeliveryRiderDetails] = useState(null);

  // Helper function to format the current date and time
  const formatDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleConfirmDelivery = () => {
    const confirmationDate = formatDate();
    axios
      .patch(
        `https://backend-rho-three-58.vercel.app/delivery/${orderData.delivery_id}`,
        {
          is_delivered_to_buyer: true,
          confirmation_date: confirmationDate,
        }
      )
      .then((res) => {
        setOrderData((prev) => ({
          ...prev,
          is_delivered_to_buyer: true,
          confirmation_date: confirmationDate,
        }));
        alert("Delivery confirmed");
      })
      .catch((err) => {
        alert("Error confirming delivery: " + err.message);
      });
  };

  // Fetch order details based on the orderID
  useEffect(() => {
    axios
      .get(
        `https://backend-rho-three-58.vercel.app/delivery-by-orderID/${orderID}`
      )
      .then((res) => {
        setOrderData(res.data[0]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderID]);

  // Fetch delivery rider details if orderData exists
  useEffect(() => {
    if (orderData && orderData.delivery_rider_id) {
      axios
        .get(
          `https://backend-rho-three-58.vercel.app/users/${orderData.delivery_rider_id}`
        )
        .then((res) => {
          setDeliveryRiderDetails(res.data);
        })
        .catch((err) => setError(err.message));
    }
  }, [orderData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.darkGreen} />
        <Text>Loading delivery data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const steps = [
    {
      title: "Order Processed",
      description: "The order has been processed.",
      isCompleted: orderData.delivery_status === "Delivery Processed",
    },
    {
      title: "Assigned to Delivery Rider",
      description: orderData.delivered_to_sc
        ? `Assigned to: ${
            deliveryRiderDetails?.first_name +
            " " +
            deliveryRiderDetails?.last_name
          }\nContact: ${deliveryRiderDetails?.mobile_number}\nOn: ${
            orderData.delivered_to_sc
          }`
        : "Not yet assigned to a delivery rider.",
      isCompleted: !!orderData.delivered_to_sc,
    },
    {
      title: "Delivered to Buyer",
      description: orderData.is_delivered_to_buyer
        ? `Delivered on: ${orderData.delivered_to_dc}`
        : "Not yet delivered to buyer.",
      isCompleted: orderData.is_delivered_to_buyer,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} />
      <View style={styles.detailsContainer}>
        <Text style={styles.header}>Delivery Progress</Text>
        <Text style={styles.infoText}>
          Order ID: <Text style={styles.bold}>{orderData.order_id}</Text>
        </Text>
        {orderData.delivery_id && (
          <Text style={styles.infoText}>
            Delivery ID:{" "}
            <Text style={styles.bold}>{orderData.delivery_id}</Text>
          </Text>
        )}

        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <Text
              style={[styles.stepTitle, step.isCompleted && styles.currentStep]}
            >
              {step.title}
            </Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.confirmButton,
            orderData.is_delivered_to_buyer && styles.disabledButton,
          ]}
          onPress={handleConfirmDelivery}
          disabled={orderData.is_delivered_to_buyer}
        >
          <Text style={styles.confirmButtonText}>
            {orderData.is_delivered_to_buyer
              ? "Delivery Confirmed"
              : "Confirm Delivery"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  detailsContainer: {
    width: "100%",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
  },
  stepContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  stepTitle: {
    fontSize: 20,
    color: "black",
  },
  stepDescription: {
    fontSize: 16,
    color: "#555",
  },
  currentStep: {
    color: colors.darkGreen,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 18,
  },
});

export default Tracking;
