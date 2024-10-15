import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Item from "../../components/item";
import colors from "../../constants/colors";
import logo from "../../assets/images/AgroSL.png";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth } from "../../Backend/firebase";
import { Picker } from "@react-native-picker/picker";

const Home = () => {
  const route = useRoute();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [userID, setUserID] = useState(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false); // State for loading

  useEffect(() => {
    // Monitor authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserID(user.uid); // Set user ID
      } else {
        setUserID(null); // Clear user ID
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const updateItemCount = (count) => {
    setCartItemsCount(count);
  };

  // Firebase sign-out function
  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await auth.signOut();
            navigation.navigate("Home");
          } catch (error) {
            console.error("Error signing out: ", error);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true); // Set loading to true while fetching
      try {
        const response = await axios.get(
          "https://backend-rho-three-58.vercel.app/items"
        );
        console.log(response.data);
        setItems(response.data);
      } catch (error) {
        console.log(error);
        setError(error.message);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchItems();
  }, [userID]);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response1 = await axios.get(
          `https://backend-rho-three-58.vercel.app/cart/${
            userID ? userID : null
          }`
        );

        console.log(response1.data);
        setCartItemsCount(response1.data.length);
      } catch (e) {
        setCartItemsCount(0);
        console.log(e);
      }
    };

    fetchCartItems();
  }, [userID]);

  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.item_name &&
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (rating) {
      filtered = filtered.filter((item) => item.average_rating_value >= rating);
    }

    setFilteredItems(filtered);
  }, [searchTerm, category, rating, items]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const handlePress = (item) => {
    if (item && item.item_id) {
      navigation.navigate("Item", {
        itemID: item.item_id,
      });
    } else {
      console.error("Item ID is missing.");
      Alert.alert("Error", "Item ID is missing.");
    }
  };

  const increaseCartCount = () => {
    setCartItemsCount(cartItemsCount + 1);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <TextInput
          placeholder="Orange, Carrot, Bean..."
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />
        <TouchableOpacity
          onPress={() => {
            if (userID) {
              navigation.navigate("Cart");
            } else {
              navigation.navigate("Sign_In");
            }
          }}
          style={styles.cartButton}
        >
          {userID ? (
            <>
              <FontAwesome
                name="shopping-basket"
                size={24}
                color={colors.darkGreen}
              />
              {cartItemsCount > 0 && (
                <View style={styles.cartCountContainer}>
                  <Text style={styles.cartCountText}>{cartItemsCount}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.loginContainer}>
              <FontAwesome name="user" size={24} color={colors.darkGreen} />
              <Text style={styles.loginText}>Log In</Text>
            </View>
          )}
        </TouchableOpacity>
        {userID && (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <FontAwesome name="sign-out" size={24} color={colors.darkGreen} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Category:</Text>
        <Picker
          selectedValue={category}
          onValueChange={(value) => setCategory(value)}
          style={styles.picker1}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="Fruits" value="Fruits" />
          <Picker.Item label="Seeds" value="Seeds" />
          <Picker.Item label="Vegetables" value="Vegetables" />
          <Picker.Item label="Animal Products" value="Animal Products" />
        </Picker>
        <Text style={styles.filterLabel}>Rating:</Text>
        <Picker
          selectedValue={rating}
          onValueChange={(value) => setRating(value)}
          style={styles.picker2}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="1+" value="1" />
          <Picker.Item label="2+" value="2" />
          <Picker.Item label="3+" value="3" />
          <Picker.Item label="4+" value="4" />
          <Picker.Item label="5" value="5" />
        </Picker>
      </View>

      {loading ? ( // Show loading animation while fetching
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
          <Text>Loading items...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {filteredItems.length === 0 ? (
            <Text>No Items</Text>
          ) : (
            filteredItems.map((item, index) => (
              <Item
                key={index}
                item={item}
                buyer_id={userID}
                onPress={() => handlePress(item)}
                increaseCartCount={increaseCartCount}
              />
            ))
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: colors.lightGreen,
    height: 80,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
    height: 40,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  cartButton: {
    marginLeft: 30,
  },
  cartCountContainer: {
    position: "absolute",
    top: -15,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    padding: 3,
  },
  cartCountText: {
    color: "white",
    fontSize: 12,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginText: {
    marginLeft: 5,
  },
  logoutButton: {
    marginLeft: 30,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    height: 70,
  },
  filterLabel: {
    fontWeight: "bold",
  },
  picker1: {
    height: 50,
    width: 180,
  },
  picker2: {
    height: 50,
    width: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
});

export default Home;
