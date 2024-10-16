import { MaterialIcons } from "@expo/vector-icons";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import colors from "../constants/colors";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const Item = ({ item, onPress, buyer_id, increaseCartCount }) => {
  const navigation = useNavigation();

  const handleAddToCart = async (item) => {
    //console.log(buyer_id);
    if (buyer_id) {
      try {
        const item_id = item.item_id;
        const price = item.unit_price;

        const response = await axios.post(
          `https://backend-rho-three-58.vercel.app/cart`,
          {
            buyer_id: buyer_id,
            item_id: item_id,
            quantity: 1,
            price: price,
          }
        );

        alert("Item successfully added to the cart");
        increaseCartCount();
      } catch (err) {
        if (err.response && err.response.status === 409) {
          alert("This item is already in the cart");
        } else {
          console.error("Error adding item to cart:", err);
        }
      }
    } else {
      alert("Please log in to add items to the cart");
      navigation.navigate("Sign_In");
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Item Info */}
        <View>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.item_name}
          </Text>
          <Text style={styles.price}>
            LKR {item.unit_price.toLocaleString()} /{item.unit_type}
          </Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={20} color="orange" />
          <Text style={styles.ratingText}>{item.average_rating_value}/5</Text>
        </View>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => handleAddToCart(item)}
      >
        <View style={styles.cartIconContainer}>
          <MaterialIcons name="shopping-cart" size={26} color="white" />
          <MaterialIcons name="add" size={20} color="white" />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 10,
    overflow: "hidden",
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    maxWidth: "100%",
  },
  price: {
    fontSize: 16,
    color: "#888",
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#888",
  },
  addToCartButton: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.darkGreen,
    height: 55,
    width: 55,
    borderRadius: 50,
    marginRight: 15,
    elevation: 2,
  },
  cartIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Item;
