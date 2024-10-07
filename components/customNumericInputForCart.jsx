import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";

const CustomNumericInput = ({
  quantity,
  setQuantity,
  minValue = 0,
  maxValue = 1000,
}) => {
  const handleIncrement = () => {
    if (quantity < maxValue) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > minValue) setQuantity(quantity - 1);
  };

  const handleInputChange = (value) => {
    const numericValue = parseInt(value, 10);

    // Ensure that the input value is a number and within the min-max range
    if (
      !isNaN(numericValue) &&
      numericValue >= minValue &&
      numericValue <= maxValue
    ) {
      setQuantity(numericValue);
    } else if (value === "") {
      setQuantity(""); // Allow clearing the input temporarily
    }
  };

  return (
    <View style={styles.container}>
      {/* Decrease Button */}
      <TouchableOpacity style={styles.button} onPress={handleDecrement}>
        <MaterialIcons name="remove" size={15} color="white" />
      </TouchableOpacity>

      {/* Numeric Input */}
      <TextInput
        style={styles.input}
        value={quantity.toString()}
        keyboardType="numeric"
        onChangeText={handleInputChange}
      />

      {/* Increase Button */}
      <TouchableOpacity style={styles.button} onPress={handleIncrement}>
        <MaterialIcons name="add" size={15} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: "green",
    borderRadius: 30,
    padding: 10,
    marginHorizontal: 5,
  },
  input: {
    width: 81,
    textAlign: "center",
    fontSize: 18,
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 5,
  },
});

export default CustomNumericInput;
