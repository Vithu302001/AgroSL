import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import logo from "../../assets/images/AgroSL.png";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Backend/firebase";
import axios from "axios";
import colors from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";

const Sign_Up_Buyer = () => {
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [reenteredpassword, setReenteredpassword] = useState("");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const namePattern = /^[A-Za-z ]+$/;
  const phonePattern = /^07[0-9]{8}$/;

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");

  const navigation = useNavigation();
  const handleSignUp = async () => {
    if (password !== reenteredpassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    if (!emailPattern.test(email)) {
      Alert.alert("Please enter a valid email address");
      return;
    }

    if (!passwordPattern.test(password)) {
      Alert.alert(
        "Password must be at least 8 characters long and include at least one letter and one number"
      );
      return;
    }

    if (!namePattern.test(firstname)) {
      Alert.alert("Please enter a valid first name (letters only)");
      return;
    }

    if (!namePattern.test(lastname)) {
      Alert.alert("Please enter a valid last name (letters only)");
      return;
    }

    if (!phonePattern.test(phonenumber)) {
      Alert.alert("Please enter a valid phone number (e.g., 0712345678)");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User created:", user);

      const userId = user.uid;
      const newUser = {
        user_id: userId,
        first_name: firstname,
        last_name: lastname,
        mobile_number: phonenumber,
        email: email,
        address_id: "",
        user_type: "buyer",
      };

      await axios.post(
        "https://backend-rho-three-58.vercel.app/users",
        newUser
      );
      await axios.post(
        "https://backend-rho-three-58.vercel.app/buyer",
        newUser
      );

      Alert.alert("Account created successfully");
      clearFields();
      navigation.navigate("Sign_In");
    } catch (error) {
      console.error("Error creating user:", error);
      Alert.alert("Error creating account");
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    setEmailError(
      emailPattern.test(value) ? "" : "Please enter a valid email address."
    );
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setPasswordError(
      passwordPattern.test(value)
        ? ""
        : "Password must be at least 8 characters long and include at least one letter and one number."
    );
  };

  const handleFirstNameChange = (value) => {
    setFirstname(value);
    setFirstNameError(
      namePattern.test(value)
        ? ""
        : "Please enter a valid first name (letters only)."
    );
  };

  const handleLastNameChange = (value) => {
    setLastname(value);
    setLastNameError(
      namePattern.test(value)
        ? ""
        : "Please enter a valid last name (letters only)."
    );
  };

  const handlePhoneChange = (value) => {
    setPhonenumber(value);
    setPhoneNumberError(
      phonePattern.test(value)
        ? ""
        : "Please enter a valid phone number (e.g., 0712345678)."
    );
  };

  const clearFields = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhonenumber("");
    setPassword("");
    setReenteredpassword("");
    setEmailError("");
    setPasswordError("");
    setFirstNameError("");
    setLastNameError("");
    setPhoneNumberError("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Image source={logo} style={styles.logo} />
      <Text style={styles.heading}>Create an Account</Text>
      <View style={styles.inputContainer}>
        <Icon name="person-outline" size={20} color={colors.forestGreen} />
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstname}
          onChangeText={handleFirstNameChange}
        />
      </View>
      {firstNameError ? (
        <Text style={styles.errorText}>{firstNameError}</Text>
      ) : null}
      <View style={styles.inputContainer}>
        <Icon name="person-outline" size={20} color={colors.forestGreen} />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastname}
          onChangeText={handleLastNameChange}
        />
      </View>
      {lastNameError ? (
        <Text style={styles.errorText}>{lastNameError}</Text>
      ) : null}
      <View style={styles.inputContainer}>
        <Icon name="call" size={20} color={colors.forestGreen} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phonenumber}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
        />
      </View>
      {phoneNumberError ? (
        <Text style={styles.errorText}>{phoneNumberError}</Text>
      ) : null}
      <View style={styles.inputContainer}>
        <Icon name="mail-outline" size={20} color={colors.forestGreen} />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <View style={styles.inputContainer}>
        <Icon name="lock-outline" size={20} color={colors.forestGreen} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
        />
      </View>
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      <View style={styles.inputContainer}>
        <Icon name="lock-outline" size={20} color={colors.forestGreen} />
        <TextInput
          style={styles.input}
          placeholder="Re-Enter Password"
          value={reenteredpassword}
          onChangeText={setReenteredpassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Sign_Up_Seller")}>
        <Text style={styles.sellerLink}>Create a Seller Account</Text>
      </TouchableOpacity>
      <View style={styles.loginContainer}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Sign_In")}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: -100,
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
  },
  button: {
    backgroundColor: colors.forestGreen,
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    width: "95%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sellerLink: {
    color: colors.darkGreen,
    marginTop: 10,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  loginLink: {
    color: colors.darkGreen,
    fontWeight: "bold",
  },
});

export default Sign_Up_Buyer;
