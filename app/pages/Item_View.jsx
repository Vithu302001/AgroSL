import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import Review from "../../components/review";
import CustomNumericInput from "../../components/customNumericInput";
import { auth } from "../../Backend/firebase"; // Import Firebase authentication

const Item_View = () => {
  const route = useRoute();
  const { itemID } = route.params;
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [userID, setUserID] = useState(null);
  const navigation = useNavigation();

  // Authentication state change listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserID(user ? user.uid : null);
    });

    return () => unsubscribe();
  }, []);

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(
          `http://192.168.234.167:5001/items/${itemID}`
        );
        setItem(res.data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemID]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://192.168.234.167:5001/reviews/${itemID}`
        );
        setReviews(response.data);
      } catch (error) {
        console.log("Error fetching reviews:", error.message);
      }
    };

    fetchReviews();
  }, [itemID]);

  // Handle review submission
  const handleReviewSubmit = async ({ rating, comment }) => {
    if (comment.trim() && rating > 0) {
      try {
        const response = await axios.post(
          "http://192.168.234.167:5001/reviews",
          {
            item_id: itemID,
            description: comment,
            rating,
            buyer_id: userID,
          }
        );

        if (response.status === 201) {
          setReviews([
            ...reviews,
            {
              item_id: itemID,
              description: comment,
              rating,
              buyer_id: userID,
              first_name: "You",
              last_name: " ",
            },
          ]);
          alert("Review submitted successfully");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    } else {
      alert("Please provide a review and rating");
    }
  };

  // Add item to cart
  const addToCart = async () => {
    if (!userID) {
      alert("Please log in to add items to your cart.");
      navigation.navigate("Sign_In");
      return;
    }

    try {
      const response = await axios.post(`http://192.168.234.167:5001/cart`, {
        buyer_id: userID,
        item_id: item.item_id,
        quantity,
        price: item.unit_price,
      });

      alert("Item successfully added to the cart");
      navigation.navigate("Cart");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert("This item is already in the cart");
      } else {
        console.error(`Error adding item to cart: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#4CAF50"
        style={styles.loadingIndicator}
      />
    );
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {item && (
        <>
          <Image
            source={{ uri: item.image_url }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.headingContainer}>
            <Text style={styles.itemName}>{item.item_name}</Text>
            <Text style={styles.rating}>{item.average_rating_value} / 5</Text>
          </View>
          <View style={styles.quantityContainer}>
            <CustomNumericInput
              quantity={quantity}
              setQuantity={setQuantity}
              maxValue={1000}
              minValue={1}
            />
            <Text style={styles.price}>
              LKR {parseFloat(item.unit_price) * quantity}.00
            </Text>
          </View>
          <Text style={styles.description}>{item.description}</Text>
          <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
          <Review reviews={reviews} onSubmit={handleReviewSubmit} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  itemImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,

    elevation: 5, // For Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  rating: {
    fontSize: 16,
    color: "#FFC107", // Golden color for ratings
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50", // Green color for price
  },
  description: {
    marginVertical: 10,
    fontSize: 15,
    color: "#555",
  },
  addToCartButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 20,
    borderRadius: 8,
    elevation: 3, // For shadow
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 50,
  },
});

export default Item_View;
