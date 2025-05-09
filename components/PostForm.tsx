import React, { useState } from "react";
import {
  TextInput,
  Button,
  StyleSheet,
  View,
  Alert,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // for handling storage

const API_URL = "http://localhost:5001"; // Your backend API URL

interface PostFormState {
  content: string;
  image_url?: string;
}

interface PostFormProps {
  onPostCreated: () => void; // Callback function after post creation
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const [form, setForm] = useState<PostFormState>({
    content: "",
    image_url: "",
  });
  const [isLoading, setIsLoading] = useState(false); // To show loading state

  const handlePostSubmit = async () => {
    if (!form.content) {
      Alert.alert("Error", "Content cannot be empty");
      return;
    }

    try {
      setIsLoading(true); // Set loading state to true
      const token = await AsyncStorage.getItem("token"); // Get the token from AsyncStorage
      if (!token) {
        Alert.alert("Error", "You must be logged in to post.");
        return;
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form), // Ensure form is properly stringified
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Post Created", "Your post has been successfully created!");
        setForm({ content: "", image_url: "" }); // Reset form
        onPostCreated(); // Trigger the callback after successful post creation
      } else {
        Alert.alert("Error", data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false); // Stop loading state
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={form.content}
        onChangeText={(content) => setForm({ ...form, content })}
        multiline
        numberOfLines={4}
        placeholderTextColor="#A0A0A0"
      />
      <TextInput
        style={styles.input}
        placeholder="Optional: Share a Clip"
        value={form.image_url}
        onChangeText={(image_url) => setForm({ ...form, image_url })}
        placeholderTextColor="#A0A0A0"
      />
      <TouchableOpacity
        style={[
          styles.submitButton,
          isLoading ? styles.buttonDisabled : styles.buttonActive,
        ]}
        onPress={handlePostSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? "Submitting..." : "Submit Post"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get("window"); // Get screen width

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "rgba(35, 35, 35, 0.5)",
    backgroundColor: "rgba(7, 7, 7, 0.5)",

    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    width: width * 0.95, // Set the width to 95% of the screen width
    alignSelf: "center", // Center the form horizontally
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    // fontFamily: "Courier New",

    fontSize: 16,
    fontWeight: "400",
    width: "100%", // Ensure inputs fill the container width
  },
  submitButton: {
    borderRadius: 12, // Rounded corners for the button
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    // fontFamily: "Courier New",

    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  buttonActive: {
    backgroundColor: "#29ffa4", // Green button for active state
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7", // Light green for disabled state
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    // fontFamily: "Courier New",

    color: "#000",
  },
});

export default PostForm;
