import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

const ComplaintPage = () => {
  const navigate = useNavigation();
  const auth = getAuth();
  const route = useRoute();

  // Extract order_id and seller_id passed from the previous page
  const { order_id, seller_id } = route.params;

  const [description, setDescription] = useState("");
  const [complainSeller, setComplainSeller] = useState(false);
  const [error, setError] = useState("");
  const [buyerId, setBuyerId] = useState(null);

  // Get the authenticated user and set buyerId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setBuyerId(user.uid);
      } else {
        setError("You need to be logged in to submit a complaint.");
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSubmit = async () => {
    if (!description) {
      setError("Description is required");
      return;
    }

    try {
      const response = await axios.post(
        "https://backend-rho-three-58.vercel.app/api/complaints",
        {
          buyer_id: buyerId,
          description,
          seller_id,
          order_id,
          complaint_seller: complainSeller,
          complaint_status_seller: "reviewing",
        }
      );

      if (response.status === 200) {
        alert("Complaint submitted successfully!");
        navigate.goBack();
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError("Failed to submit the complaint. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit a Complaint</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Order ID</Text>
        <TextInput value={order_id} editable={false} style={styles.input} />
        <Text style={styles.label}>Seller ID</Text>
        <TextInput value={seller_id} editable={false} style={styles.input} />
        <Text style={styles.label}>Complaint Description</Text>
        <TextInput
          placeholder="Enter the complaint description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.textarea}
        />

        {/* Custom Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setComplainSeller(!complainSeller)}
        >
          <View style={styles.checkbox}>
            {complainSeller ? <View style={styles.checkboxChecked} /> : null}
          </View>
          <Text style={styles.checkboxLabel}>Complaint Against Seller</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit Complaint</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    flex: 1,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
  },
  textarea: {
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    height: 100,
    textAlignVertical: "top",
    backgroundColor: "#f0f0f0",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: "#ccc",
    borderWidth: 2,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    backgroundColor: "#4CAF50",
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});

export default ComplaintPage;
