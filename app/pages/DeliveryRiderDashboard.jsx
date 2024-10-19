import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { auth } from "../../Backend/firebase";
import axios from "axios";
import Deliveries from "./Deliveries";
import Rider_Orders from "./RiderOrders";
import Profile from "./Profile";

export default function DeliveryRiderDashboard() {
  const route = useRoute();
  const navigation = useNavigation();
  const riderId = route.params?.riderId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState("View Orders");

  useEffect(() => {
    const currentUser = auth.currentUser;
    console.log(currentUser);
    if (currentUser) {
      axios
        .get(`https://backend-rho-three-58.vercel.app/users/${currentUser.uid}`)
        .then((res) => {
          setUser(res.data);
          console.log("User data:", res.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
          Alert.alert("Error", err.message);
        });
    }
  }, []);

  const handleNavigation = (path) => {
    navigation.navigate(path, { riderId });
  };

  if (loading) return <ActivityIndicator size="large" color="#007BFF" />;

  if (error) return <Text style={styles.error}>{error}</Text>;

  const renderContent = () => {
    if (selectedValue === "View Orders")
      return <Rider_Orders riderId={riderId} />;
    if (selectedValue === "View Deliveries")
      return <Deliveries riderId={riderId} />;
    if (selectedValue === "Profile") return <Profile />;
  };

  return (
    <View style={styles.container}>
      {/* Top Menu */}
      <View style={styles.topMenu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setSelectedValue("View Orders")}
        >
          <Text style={styles.menuText}>View Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setSelectedValue("View Deliveries")}
        >
          <Text style={styles.menuText}>View Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setSelectedValue("Profile")}
        >
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <FlatList
        data={[{ key: selectedValue }]} // Only one element to trigger rendering
        renderItem={renderContent}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#e6ffe6",
    padding: 20,
  },
  topMenu: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: "white",
    alignItems: "center",
    padding: 15,
    width: "33%",
  },
  menuText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  infoValue: {
    fontWeight: "400",
  },
  error: {
    color: "red",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
});
