import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";

const Tracking = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Extract orderID passed from the orders page
  const { orderID } = route.params;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleConfirmDelivery = () => {
    const formatDate = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const confirmationDate = formatDate();
    axios
      .patch(`http://192.168.234.167:5001/delivery/${orderData.delivery_id}`, {
        is_delivered_to_buyer: true,
        confirmation_date: confirmationDate,
      })
      .then((res) => {
        setOrderData((prevOrderData) => ({
          ...prevOrderData,
          is_delivered_to_buyer: true,
          confirmation_date: confirmationDate,
        }));
        alert("Delivery confirmed");
      })
      .catch((err) => {
        alert("Error confirming delivery: " + err.message);
      });
  };

  useEffect(() => {
    axios
      .get(`http://192.168.234.167:5001/delivery-by-orderID/${orderID}`)
      .then((res) => {
        setOrderData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderID]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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

  if (!orderData) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No delivery data found</Text>
      </View>
    );
  }

  // Logic to determine button state
  const isDeliveryConfirmed = orderData.is_delivered_to_buyer;
  const isDeliveryProcessed =
    orderData.delivery_status === "Delivery Processed" ||
    orderData.delivery_status === "Delivered";

  const steps = [
    {
      title: "Order Processed",
      description: "The order has been processed.",
      isCompleted: isDeliveryProcessed,
    },
    {
      title: "Sent to delivery rider",
      description: orderData.delivered_to_sc
        ? `Delivered to delivery rider (${orderData.delivery_rider_id}) on ${orderData.delivered_to_sc}`
        : "Not yet delivered to delivery rider",
      isCompleted: orderData.delivered_to_sc !== null,
    },
    {
      title: "Delivered to Buyer",
      description: isDeliveryConfirmed
        ? `Delivered to buyer on ${orderData.confirmation_date}`
        : "Not yet delivered to buyer",
      isCompleted: isDeliveryConfirmed,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Delivery Progress</Text>

      <Text style={styles.infoText}>
        Order ID: <Text style={styles.bold}>{orderData.order_id}</Text>
      </Text>
      <Text style={styles.infoText}>
        Delivery ID: <Text style={styles.bold}>{orderData.delivery_id}</Text>
      </Text>

      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <Text
            style={[
              styles.stepTitle,
              step.isCompleted && styles.bold && styles.currentStep,
            ]}
          >
            {step.title}
          </Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
      ))}

      <TouchableOpacity
        style={[
          styles.confirmButton,
          isDeliveryConfirmed && styles.disabledButton,
        ]}
        onPress={handleConfirmDelivery}
        disabled={isDeliveryConfirmed}
      >
        <Text style={styles.confirmButtonText}>
          {isDeliveryConfirmed ? "Delivery Confirmed" : "Confirm Delivery"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
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
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 15,
  },
  bold: {
    fontWeight: "bold",
  },
  stepContainer: {
    width: "100%",
    borderBlockColor: "#ccc",
    borderBottomWidth: 2,
    justifyContent: "flex-start",
    marginBottom: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  stepTitle: {
    fontSize: 20,
    color: "black",
  },
  stepDescription: {
    fontSize: 16,
    color: "#555",
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
  currentStep: {
    color: colors.darkGreen,
    fontSize: 25,
  },
});

export default Tracking;
