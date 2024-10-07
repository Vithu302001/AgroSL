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
import logo from "../../assets/images/AgroSL.png";
import colors from "../../constants/colors";
import { auth } from "../../Backend/firebase"; // Ensure firebase is properly configured
import { onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

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
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        axios
          .get(`http://192.168.234.167:5001/users/${currentUser.uid}`)
          .then((res) => {
            setUser(res.data);
            setUpdatedUser(res.data);
          })
          .catch((err) => {
            setError(err.message);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setUser(null);
        setUpdatedUser({
          pb_number: "Not set yet",
          street_name: "Not set yet",
          city: "Not set yet",
          district: "Not set yet",
        });
        setAddressup({});
        setLoading(false);
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (updatedUser?.address_id) {
      axios
        .get(
          `http://192.168.234.167:5001/get_user_address/${updatedUser.user_id}`
        )
        .then((res) => {
          setAddressup({
            pb_number: res.data.user_address.pb_number || "Not set yet",
            street_name: res.data.user_address.street_name || "Not set yet",
            city: res.data.user_address.city || "Not set yet",
            district: res.data.user_address.district || "Not set yet",
          });
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [updatedUser]);

  const handleInputChange = (name, value) => {
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleAddressChange = (name, value) => {
    console.log(name, value);
    setAddressup((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log("Updated address:", addressup);
  }, [addressup]);

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSaveClick = () => {
    const combinedData = {
      ...updatedUser,
      addressup: addressup,
    };
    console.log(combinedData);
    axios
      .put(`http://192.168.234.167:5001/users/${user.user_id}`, combinedData) // Ensure correct ID usage
      .then((res) => {
        setUser(res.data);
        setUpdatedUser(res.data);
        setIsEditable(false);
        setError(null); // Clear error on success
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.darkGreen} />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return Alert.alert(
      "User Not Signed In",
      "Please sign in to continue.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"), // Handle cancel
          style: "cancel",
        },
        {
          text: "Sign In",
          onPress: () => {
            // Navigate to sign-in screen (adjust the navigation logic as needed)
            navigation.navigate("Sign_In"); // Replace 'SignIn' with your actual sign-in screen name
          },
        },
      ],
      { cancelable: false }
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.greeting}>Hi! {user?.first_name || "User"}</Text>
        <Image source={logo} style={styles.avatar} />

        {/* User Input Fields */}
        {["first_name", "last_name", "email", "mobile_number"].map(
          (field, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={field
                .replace("_", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              value={updatedUser[field] || ""}
              editable={isEditable}
              onChangeText={(value) => handleInputChange(field, value)}
            />
          )
        )}

        {/* Address Fields */}
        {["pb_number", "street_name", "city", "district"].map(
          (field, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={field
                .replace("_", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              value={addressup[field]}
              editable={isEditable}
              onChangeText={(value) => handleAddressChange(field, value)}
            />
          )
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSaveClick}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
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
  input: {
    width: "90%",
    borderBottomWidth: 2,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 6,
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});

export default Profile;
