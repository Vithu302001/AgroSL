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
  const [currentUser, setCurrentUser] = useState(null); // Track the current user

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        // Clear cart items when user logs out
        console.log("No user ");
        setCartItems([]);
        updateTotalPrice(0, 0);
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Fetch the cart items only when the user is available and screen is focused
      if (currentUser) {
        const fetchCartItems = async () => {
          setLoading(true);
          try {
            const response = await axios.get(
              `http://192.168.234.167:5001/cartWithSellerName/${currentUser.uid}`
            );
            setCartItems(response.data); // Update the cart items from the backend
            updateTotalPrice(
              calculateTotalPrice(response.data),
              response.data.length
            ); // Update the total price based on the updated cart items
          } catch (err) {
            setError(err.message);
            setCartItems([]); // Handle empty or error state
          } finally {
            setLoading(false);
          }
        };

        fetchCartItems();
      } else {
        setLoading(false); // Handle case where user is not logged in
      }
    }, [currentUser]) // This effect will re-run when the currentUser changes or screen is focused
  );

  const calculateTotalPrice = (items) => {
    return items.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0
    );
  };

  const handleDelete = async (rowKey, itemId) => {
    try {
      await axios.delete(
        `http://192.168.234.167:5001/cart/${currentUser.uid}/${itemId}`
      );
      const newCartItems = cartItems.filter(
        (_, index) => index !== parseInt(rowKey, 10)
      );
      setCartItems(newCartItems);
      updateTotalPrice(calculateTotalPrice(newCartItems), newCartItems.length); // Update the total price after removal
    } catch (err) {
      console.error("Error removing item:", err);
      Alert.alert("Error", "Failed to remove item from cart.");
    }
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity = newQuantity;
    setCartItems(updatedCartItems);
    updateTotalPrice(
      calculateTotalPrice(updatedCartItems),
      updatedCartItems.length
    ); // Update the total price on quantity change
  };

  const renderItems = ({ item, index }) => (
    <Pressable style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.item_name}</Text>
          <Text style={styles.itemSeller}>Seller: {item.seller_name}</Text>
          <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        </View>
        <CustomNumericInputForCart
          minValue={1}
          maxValue={1000}
          quantity={item.quantity}
          setQuantity={(value) => handleQuantityChange(index, value)}
        />
        <Text style={styles.itemPrice}>
          ${(item.quantity * parseFloat(item.price)).toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );

  const renderHiddenItem = (data, rowMap) => {
    const { index, item } = data;
    return (
      <View style={styles.hiddenItemContainer}>
        <Pressable
          onPressIn={() => setIsPressed(true)} // Set pressed state to true on press in
          onPressOut={() => setIsPressed(false)} // Set pressed state to false on press out
          onPress={() => {
            handleDelete(index.toString(), item.item_id);
            if (rowMap[index] !== undefined) {
              rowMap[index]?.closeRow();
            }
          }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? "red" : colors.lightGreen }, // Change background color on press
          ]}
        >
          <FontAwesome name="trash" size={24} color="white" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text>Loading items...</Text>
        </View>
      ) : cartItems.length > 0 ? (
        <SwipeListView
          rightOpenValue={-50}
          previewRowKey={"0"}
          previewOpenValue={-40}
          previewOpenDelay={3000}
          data={cartItems}
          renderItem={renderItems}
          renderHiddenItem={renderHiddenItem}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <EmptyCart />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 6,
    marginVertical: 4,
  },
  itemContainer: {
    width: "98%",
    borderRadius: 10,
    marginHorizontal: "auto",
    marginBottom: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    height: 100,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: "bold",
  },
  itemSeller: {
    color: "gray",
  },
  itemQuantity: {
    color: "gray",
  },
  itemPrice: {
    fontWeight: "bold",
  },
  hiddenItemContainer: {
    flex: 1,
    alignItems: "flex-end",
    backgroundColor: colors.lightGreen,
    borderRadius: 10,
    justifyContent: "center",
    paddingRight: 10,
    marginBottom: 10,
  },
  button: {
    borderRadius: 10,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Cart_Item_View;
