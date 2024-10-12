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
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";
import logo from "../../assets/images/AgroSL.png";

const Tracking = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // Extract orderID passed from the orders page
  const { orderID } = route.params;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryRiderDetails, setDeliveryRiderDetails] = useState(null);

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
      .patch(
        `http://backend-rho-three-58.vercel.app/delivery/${orderData.delivery_id}`,
        {
          is_delivered_to_buyer: true,
          confirmation_date: confirmationDate,
        }
      )
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

  // Fetch delivery data using orderID
  useEffect(() => {
    axios
      .get(
        `http://backend-rho-three-58.vercel.app/delivery-by-orderID/${orderID}`
      )
      .then((res) => {
        setOrderData(res.data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [orderID]);

  // Fetch delivery rider details after orderData is fetched
  useEffect(() => {
    if (orderData && orderData.delivery_rider_id) {
      axios
        .get(
          `http://backend-rho-three-58.vercel.app/users/${orderData.delivery_rider_id}`
        )
        .then((res) => {
          setDeliveryRiderDetails(res.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
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
        ? `Delivered to delivery rider : ${
            deliveryRiderDetails?.first_name +
            " " +
            deliveryRiderDetails?.last_name
          }\nContact Number : ${deliveryRiderDetails?.mobile_number} \non ${
            orderData?.delivered_to_sc
          }`
        : "Not yet delivered to delivery rider",
      isCompleted: orderData.delivered_to_sc !== null,
    },
    {
      title: "Delivered to Buyer",
      description: isDeliveryConfirmed
        ? `Delivered to buyer on ${orderData.delivered_to_sc}`
        : "Not yet delivered to buyer",
      isCompleted: isDeliveryConfirmed,
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={styles.container2}
    >
      <Image source={logo} style={{ width: 100, height: 100 }} />
      <View style={styles.container2}>
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
                step.isCompleted ? styles.currentStep : null,
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    borderStartColor: "green",
    borderStartWidth: 5,
  },
  container2: {
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    display: "flex",
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
  currentStep: {
    color: colors.darkGreen,
    fontSize: 22,
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
});

export default Tracking;
