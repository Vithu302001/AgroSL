import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import colors from "../../constants/colors";
import Cart_Item_View from "../../components/Cart_Items";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../../Backend/firebase";

const Cart_Items_Page = () => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const navigation = useNavigation();
  const currentUser = auth.currentUser;

  const updateTotalPrice = (newTotal, count) => {
    setTotalPrice(newTotal);
    setItemCount(count);
  };

  useEffect(() => {
    console.log("Cart Items Page");
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cart Items</Text>
      <View style={styles.cartList}>
        <Cart_Item_View updateTotalPrice={updateTotalPrice} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.totalText}>
          Items:{itemCount} | Total: LKR {totalPrice}.00
        </Text>
        <Button
          title="Checkout"
          onPress={() =>
            navigation.navigate("CheckOut", {
              totalPrice: totalPrice,
              // You can also pass other data here, like cart items if needed
            })
          }
          color={colors.seaGreen}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  heading: {
    color: colors.seaGreen,
    fontWeight: "bold",
    fontSize: 28,
    textAlign: "center",
    marginVertical: 20,
  },
  scrollContainer: {
    paddingBottom: 80, // Adjust for footer space
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cartList: {
    flex: 1,
    height: "80%",
    marginBottom: 60,
  },
});

export default Cart_Items_Page;
