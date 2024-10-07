import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker here

const Review = ({ reviews, onSubmit }) => {
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (rating && comment.trim()) {
      await onSubmit({ rating, comment });
      setRating("");
      setComment("");
    } else {
      alert("Please provide both a rating and a comment.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reviews</Text>
      <ScrollView style={styles.reviewBox}>
        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>No reviews available</Text>
        ) : (
          reviews.map((item, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>
                  {item?.first_name} {item?.last_name}
                </Text>
                <Text style={styles.reviewRating}>
                  {item.rating ? item.rating : "not reviewed yet"} / 5
                </Text>
              </View>
              <Text style={styles.reviewText}>{item.description}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.leaveReview}>
        <Text style={styles.subHeading}>Leave a review</Text>
        <View style={styles.formControl}>
          <Text style={styles.label}>Rating</Text>
          <View style={styles.selectContainer}>
            <Picker
              selectedValue={rating}
              style={styles.selectInput}
              onValueChange={(itemValue) => setRating(itemValue)}
            >
              <Picker.Item label="Choose rate" value="" />
              <Picker.Item label="1 - Poor" value="1" />
              <Picker.Item label="2 - Fair" value="2" />
              <Picker.Item label="3 - Good" value="3" />
              <Picker.Item label="4 - Very Good" value="4" />
              <Picker.Item label="5 - Awesome" value="5" />
            </Picker>
          </View>
        </View>
        <View style={styles.formControl}>
          <Text style={styles.label}>Comment</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Your comment"
            value={comment}
            onChangeText={setComment}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
  },
  reviewBox: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  noReviewsText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  reviewItem: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reviewUser: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2a2a2a",
  },
  reviewRating: {
    fontSize: 14,
    color: "#666",
  },
  reviewText: {
    paddingVertical: 8,
    color: "#444",
  },
  leaveReview: {
    marginTop: 16,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  formControl: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginRight: 8,
  },
  textArea: {
    height: 70,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
  },
  submitButton: {
    backgroundColor: "#32CD32",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Review;
