import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import colors from "../../constants/colors";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Backend/firebase";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import logo from "../../assets/images/AgroSL.png";
import axios from "axios";
import * as Notifications from "expo-notifications";
import { registerForPushNotifications } from "../../Backend/notification";

function Sign_In() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const expoPushToken = useRef(null);

  const handleSignIn = async () => {
    try {
      registerForPushNotifications().then((token) => {
        expoPushToken.current = token;
      });

      // Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      sendSuccessNotification(email);

      console.log("User signed in:", email);
      const currentUser = auth.currentUser;

      // Fetch user type from backend
      handleUserRedirection(currentUser);
    } catch (error) {
      console.log("Error signing in:", error);
      Alert.alert("Error", "Username and Password Mismatched. Try again.");
    }
  };

  const handleUserRedirection = async (currentUser) => {
    try {
      const response = await axios.get(
        `https://backend-rho-three-58.vercel.app/get_user/${currentUser.uid}`
      );

      const userType = response.data.user_type;
      console.log("User type:", userType);

      if (userType === "buyer") {
        navigation.navigate("HomeTabs", { userId: currentUser.uid });
      } else if (userType === "delivery_rider") {
        navigation.navigate("DeliveryRiderDashboard", {
          userId: currentUser.uid,
        });
      } else {
        Alert.alert("Error", "User type not recognized.");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          // Check if the user is an admin
          const admin = await axios.get(
            `https://backend-rho-three-58.vercel.app/admin/${currentUser.uid}`
          );

          if (admin.data && admin.data.user_id) {
            navigation.navigate("AdminDashboard");
          } else {
            Alert.alert("Error", "User type not recognized.");
          }
        } catch (adminError) {
          console.error("Error checking admin table:", adminError);
          Alert.alert("Error", "Something went wrong. Please try again.");
        }
      } else {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    }
  };

  const sendSuccessNotification = async (email) => {
    if (expoPushToken.current) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Logged in successfully",
          body: `${email} has successfully logged in.`,
        },
        trigger: null, // Send immediately
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.heading}>Sign In</Text>
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={24} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text>Don’t have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Sign_Up_Buyer")}
          >
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -100,
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.forestGreen,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: "95%",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    marginTop: 10,
  },
  link: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default Sign_In;
