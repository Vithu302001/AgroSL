import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { auth } from "../../Backend/firebase";
import colors from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";

const Sign_Up_Seller = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [NIC, setNIC] = useState("");
  const [storeName, setStoreName] = useState("");
  const [password, setPassword] = useState("");
  const [reenteredpassword, setReenteredpassword] = useState("");

  const [errors, setErrors] = useState({
    firstNameError: "",
    lastNameError: "",
    emailError: "",
    phoneNumberError: "",
    NICError: "",
    passwordError: "",
  });

  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (password !== reenteredpassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Validate fields before creating user
    validateFields();
    if (Object.values(errors).some((error) => error)) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userId = user.uid;

      const newUser = {
        user_id: userId,
        first_name: firstname,
        last_name: lastname,
        mobile_number: phonenumber,
        email: email,
        address_id: "",
        user_type: "seller",
      };
      const newSeller = {
        user_id: userId,
        NIC: NIC,
        store_name: storeName,
      };

      await axios.post("http://192.168.234.167:5001/users", newUser);
      await axios.post("http://192.168.234.167:5001/sellers", newSeller);
      Alert.alert("Success", "Account created successfully");
      navigation.navigate("Sign_In");
    } catch (error) {
      console.error("Error creating user:", error);
      Alert.alert("Error", "Error creating account");
    }
  };

  const validateFields = () => {
    setErrors({
      firstNameError: /^[A-Za-z ]+$/.test(firstname)
        ? ""
        : "Invalid First Name",
      lastNameError: /^[A-Za-z ]+$/.test(lastname) ? "" : "Invalid Last Name",
      emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? ""
        : "Invalid Email Address",
      phoneNumberError: /^07\d{8}$/.test(phonenumber)
        ? ""
        : "Invalid Phone Number",
      NICError: /^\d{9}[vV]$|^\d{12}$/.test(NIC) ? "" : "Invalid NIC",
      passwordError:
        password.length >= 6
          ? ""
          : "Password must be at least 6 characters long",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Image
        source={require("../../assets/images/AgroSL.png")}
        style={styles.logo}
      />
      <Text style={styles.heading}>Create an Account</Text>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={20} color={colors.forestGreen} />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstname}
            onChangeText={setFirstname}
            onBlur={validateFields}
          />
        </View>
        {errors.firstNameError ? (
          <Text style={styles.errorText}>{errors.firstNameError}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={20} color={colors.forestGreen} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastname}
            onChangeText={setLastname}
            onBlur={validateFields}
          />
        </View>
        {errors.lastNameError ? (
          <Text style={styles.errorText}>{errors.lastNameError}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={20} color={colors.forestGreen} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            onBlur={validateFields}
            keyboardType="email-address"
          />
        </View>
        {errors.emailError ? (
          <Text style={styles.errorText}>{errors.emailError}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon name="call-outline" size={20} color={colors.forestGreen} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phonenumber}
            onChangeText={setPhonenumber}
            onBlur={validateFields}
            keyboardType="phone-pad"
          />
        </View>
        {errors.phoneNumberError ? (
          <Text style={styles.errorText}>{errors.phoneNumberError}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon name="card-outline" size={20} color={colors.forestGreen} />
          <TextInput
            style={styles.input}
            placeholder="NIC"
            value={NIC}
            onChangeText={setNIC}
            onBlur={validateFields}
          />
        </View>
        {errors.NICError ? (
          <Text style={styles.errorText}>{errors.NICError}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon
            name="lock-closed-outline"
            size={20}
            color={colors.forestGreen}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={validateFields}
            secureTextEntry
          />
        </View>
        {errors.passwordError ? (
          <Text style={styles.errorText}>{errors.passwordError}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Icon
            name="lock-closed-outline"
            size={20}
            color={colors.forestGreen}
          />
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
        <View style={styles.loginContainer}>
          <Text>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Sign_In")}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  scrollContainer: {
    width: "100%",
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    alignSelf: "center",
    flexDirection: "row",
    marginTop: 15,
  },
  loginLink: {
    color: colors.darkGreen,
    fontWeight: "bold",
  },
});

export default Sign_Up_Seller;
