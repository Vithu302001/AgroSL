import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../constants/colors";

const EmptyCart = () => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <FontAwesome name="shopping-basket" size={60} color={colors.seaGreen} />
        <Text style={styles.text}>CART IS EMPTY</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
    borderRadius: 75, // Make it a circle
    backgroundColor: "white",
    marginTop: 200,
    elevation: 2, // Optional: to give a slight shadow effect
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: colors.seaGreen,
    fontWeight: "bold",
    marginTop: 3,
    textAlign: "center",
  },
});

export default EmptyCart;
