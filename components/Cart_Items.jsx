import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import colors from "../constants/colors";
import CustomNumericInputForCart from "./customNumericInputForCart";
import EmptyCart from "./emptyCart";
import axios from "axios";
import { auth } from "../Backend/firebase";

const Cart_Item_View = ({ updateTotalPrice }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        console.log("No user");
        setCartItems([]);
        updateTotalPrice(0, 0); // Clear total price on logout
      }
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchCartItems = async () => {
        if (!currentUser) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const response = await axios.get(
            `https://backend-rho-three-58.vercel.app/cartWithSellerName/${currentUser.uid}`
          );
          const items = response.data;
          setCartItems(items);
          const totalPrice = calculateTotalPrice(items);
          updateTotalPrice(totalPrice, items.length);
        } catch (err) {
          setError(err.message);
          setCartItems([]);
          updateTotalPrice(0, 0); // Reset total price on error
        } finally {
          setLoading(false);
        }
      };
      fetchCartItems();
    }, [currentUser])
  );

  const calculateTotalPrice = (items) =>
    items.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0
    );

  const handleDelete = async (rowKey, itemId) => {
    try {
      await axios.delete(
        `https://backend-rho-three-58.vercel.app/cart/${currentUser.uid}/${itemId}`
      );
      const newCartItems = cartItems.filter(
        (_, index) => index !== parseInt(rowKey, 10)
      );
      setCartItems(newCartItems);
      updateTotalPrice(calculateTotalPrice(newCartItems), newCartItems.length);
    } catch (err) {
      console.error("Error removing item:", err);
      Alert.alert("Error", "Failed to remove item from cart.");
    }
  };

  const handleQuantityChange = async (index, newQuantity) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = newQuantity;
    setCartItems(updatedCartItems);
    updateTotalPrice(
      calculateTotalPrice(updatedCartItems),
      updatedCartItems.length
    );

    try {
      const itemId = updatedCartItems[index].item_id;
      console.log(itemId);
      await axios.put(
        `https://backend-rho-three-58.vercel.app/cart/${currentUser.uid}/${itemId}`,
        { quantity: newQuantity }
      );
      console.log("Quantity updated successfully!");
    } catch (err) {
      console.error("Failed to update quantity:", err);
      Alert.alert("Error", "Failed to update item quantity.");
    }
  };

  const renderItems = ({ item, index }) => (
    <Pressable style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <Text style={styles.itemSeller}>Seller: {item.seller_name}</Text>
          <Text style={styles.itemSeller}>Quantity: {item.quantity}</Text>
          <Text style={styles.itemPrice}>
            LKR:{(item.quantity * parseFloat(item.price)).toFixed(2)}
          </Text>
        </View>
        <CustomNumericInputForCart
          minValue={1}
          maxValue={1000}
          quantity={item.quantity}
          setQuantity={(value) => handleQuantityChange(index, value)}
        />
      </View>
    </Pressable>
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.hiddenItemContainer}>
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={() => {
          handleDelete(data.index.toString(), data.item.item_id);
          rowMap[data.index]?.closeRow();
        }}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? "red" : colors.lightGreen },
        ]}
      >
        <FontAwesome name="trash" size={24} color="white" />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text>Loading items...</Text>
        </View>
      ) : cartItems.length > 0 ? (
        <SwipeListView
          data={cartItems}
          renderItem={renderItems}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-50}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <>
          {updateTotalPrice(0, 0)}
          <EmptyCart />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 6, marginVertical: 4 },
  itemContainer: {
    width: "98%",
    marginBottom: 10,
    backgroundColor: "white",
    marginHorizontal: "auto",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    elevation: 2,
    height: 100,
  },
  itemContent: { flexDirection: "row", alignItems: "center", padding: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontWeight: "bold" },
  itemSeller: { color: "gray" },
  itemPrice: { fontWeight: "bold" },
  hiddenItemContainer: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
    borderRadius: 10,
    marginBottom: 10,
    paddingRight: 10,
    backgroundColor: colors.lightGreen,
  },
  button: { borderRadius: 10, padding: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default Cart_Item_View;
