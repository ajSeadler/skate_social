import React, { useState } from "react";
import {
  TextInput,
  Button,
  StyleSheet,
  View,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // for handling storage

const API_URL = "http://localhost:5001"; // Your backend API URL

interface PostFormState {
  content: string;
  image_url?: string;
}

const PostForm = () => {
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
        placeholder="Image URL (Optional)"
        value={form.image_url}
        onChangeText={(image_url) => setForm({ ...form, image_url })}
        placeholderTextColor="#A0A0A0"
      />
      <Button
        title={isLoading ? "Submitting..." : "Submit Post"}
        onPress={handlePostSubmit}
        color="#4CAF50"
        disabled={isLoading}
      />
    </View>
  );
};

const { width } = Dimensions.get("window"); // Get screen width

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(35, 35, 35, 0.5)",
    borderRadius: 10,
    padding: 20,
    marginTop: 15,
    width: width * 0.95, // Set the width to 90% of the screen width
    alignSelf: "center", // Center the form horizontally
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "400",
    width: "100%", // Ensure inputs fill the container width
  },
});

export default PostForm;
