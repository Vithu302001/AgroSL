import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import colors from "../../constants/colors";
import { auth } from "../../Backend/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import avatarPlaceholder from "../../assets/images/avatar.png"; // Default avatar image

const BASE_URL = "https://backend-rho-three-58.vercel.app";

const Profile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addressup, setAddressup] = useState({
    pb_number: "Not set yet",
    street_name: "Not set yet",
    city: "Not set yet",
    district: "Not set yet",
  });

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        resetUserData();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const res = await axios.get(`${BASE_URL}/users/${uid}`);
      setUser(res.data);
      setUpdatedUser(res.data);
      if (res.data.address_id) {
        fetchUserAddress(res.data.user_id);
      }
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddress = async (userId) => {
    try {
      const res = await axios.get(`${BASE_URL}/get_user_address/${userId}`);
      setAddressup({
        pb_number: res.data.user_address.pb_number || "Not set yet",
        street_name: res.data.user_address.street_name || "Not set yet",
        city: res.data.user_address.city || "Not set yet",
        district: res.data.user_address.district || "Not set yet",
      });
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    }
  };

  const resetUserData = () => {
    setUser(null);
    setUpdatedUser({
      pb_number: "Not set yet",
      street_name: "Not set yet",
      city: "Not set yet",
      district: "Not set yet",
    });
    setAddressup({});
    setLoading(false);
  };

  const handleInputChange = (name, value) => {
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleAddressChange = (name, value) => {
    setAddressup((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSaveClick = async () => {
    const combinedData = {
      ...updatedUser,
      addressup: addressup,
    };

    try {
      const res = await axios.put(
        `${BASE_URL}/users/${user.user_id}`,
        combinedData
      );
      setUser(res.data);
      setUpdatedUser(res.data);
      setIsEditable(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.darkGreen} />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {user ? (
        <View style={styles.container}>
          <Text style={styles.greeting}>Hi! {user.first_name || "User"}</Text>
          <Image
            source={
              user.image_url ? { uri: user.image_url } : avatarPlaceholder
            }
            style={styles.avatar}
          />

          {/* User Information Fields */}
          {["first_name", "last_name", "email", "mobile_number"].map(
            (field, index) => (
              <View key={index} style={styles.fieldContainer}>
                <Text style={styles.label}>
                  {field
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${field
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}`}
                  value={updatedUser[field] || ""}
                  editable={isEditable}
                  onChangeText={(value) => handleInputChange(field, value)}
                />
              </View>
            )
          )}

          {/* Address Fields */}
          {["pb_number", "street_name", "city", "district"].map(
            (field, index) => (
              <View key={index} style={styles.fieldContainer}>
                <Text style={styles.label}>
                  {field
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={`Enter ${field
                    .replace("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}`}
                  value={addressup[field]}
                  editable={isEditable}
                  onChangeText={(value) => handleAddressChange(field, value)}
                />
              </View>
            )
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isEditable && styles.disabledButton]}
              onPress={handleEdit}
              disabled={isEditable}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSaveClick}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      ) : (
        <>
          <Text style={styles.nousertext}>User Not signed in</Text>
          <TouchableOpacity
            style={styles.touchableopacity}
            onPress={() => navigation.navigate("Sign_In")}
          >
            <Text style={styles.buttonText2}>Sign In</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    flex: 1,
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
    width: "100%",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    marginVertical: 20,
    borderRadius: 50,
  },
  fieldContainer: {
    width: "90%",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 2,
    borderColor: "#ccc",
    padding: 8,
    fontSize: 16,
    color: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: colors.darkGreen,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  nousertext: {
    fontSize: 20,
    fontWeight: "bold",
  },
  touchableopacity: {
    backgroundColor: colors.darkGreen,
    padding: 10,
    borderRadius: 100,
    marginTop: 20,
    width: 200,
  },
  buttonText2: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default Profile;
