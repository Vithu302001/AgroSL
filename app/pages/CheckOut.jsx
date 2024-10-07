import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import colors from "../../constants/colors";

const CheckoutPage = ({ route, navigation }) => {
  const { totalPrice } = route.params; // Retrieve the total price passed from Cart_Items_Page
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Default to cash on delivery
  const [cardDetails, setCardDetails] = useState({
    name: "",
    cardNumber: "",
    cvv: "",
    zipCode: "",
  });

  const handleCheckout = () => {
    if (paymentMethod === "card") {
      // Process card payment logic
      console.log("Processing card payment", cardDetails);
    } else {
      // Process cash on delivery logic
      console.log("Cash on delivery selected");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>
      <Text style={styles.totalText}>Total Amount: ${totalPrice}</Text>

      <Text style={styles.label}>Select Payment Method:</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Cash on Delivery"
          color={paymentMethod === "cash" ? colors.seaGreen : "#ccc"}
          onPress={() => setPaymentMethod("cash")}
        />
        <Button
          title="Card Payment"
          color={paymentMethod === "card" ? colors.seaGreen : "#ccc"}
          onPress={() => setPaymentMethod("card")}
        />
      </View>

      {paymentMethod === "card" && (
        <View style={styles.cardDetails}>
          <TextInput
            placeholder="Name on Card"
            value={cardDetails.name}
            onChangeText={(text) =>
              setCardDetails({ ...cardDetails, name: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Card Number"
            value={cardDetails.cardNumber}
            onChangeText={(text) =>
              setCardDetails({ ...cardDetails, cardNumber: text })
            }
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="CVV"
            value={cardDetails.cvv}
            onChangeText={(text) =>
              setCardDetails({ ...cardDetails, cvv: text })
            }
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Zip Code"
            value={cardDetails.zipCode}
            onChangeText={(text) =>
              setCardDetails({ ...cardDetails, zipCode: text })
            }
            style={styles.input}
            keyboardType="numeric"
          />
          <Button
            title="Pay"
            onPress={handleCheckout}
            color={colors.seaGreen}
          />
        </View>
      )}

      {paymentMethod === "cash" && (
        <Button
          title="Confirm Cash on Delivery"
          onPress={handleCheckout}
          color={colors.seaGreen}
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
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cardDetails: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default CheckoutPage;
