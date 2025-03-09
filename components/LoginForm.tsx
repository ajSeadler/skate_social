import React, { useState } from "react";
import { TextInput, Button, StyleSheet, Alert, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For password visibility toggle
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = "http://localhost:5001"; // Your backend API URL

interface LoginFormState {
  email: string;
  password: string;
}

const LoginForm = () => {
  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false); // Toggle password visibility

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.ok) {
        // Store the token in AsyncStorage
        await AsyncStorage.setItem("token", data.token);
        Alert.alert("Login Successful", "Welcome back!");
        // Redirect to profile screen after successful login
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.error("Error logging in user", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={(email) => setForm({ ...form, email })}
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          value={form.password}
          onChangeText={(password) => setForm({ ...form, password })}
        />
        <Ionicons
          name={passwordVisible ? "eye" : "eye-off"}
          size={24}
          color="gray"
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!passwordVisible)}
        />
      </View>
      <Button title="Login" onPress={handleLogin} color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Center the form horizontally
    padding: 20,
    backgroundColor: "rgba(35, 35, 35, 0.5)",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    margin: 20,
    width: "90%", // Ensuring it's not too thin, take 90% of screen width
    maxWidth: 400, // Optional: Limit the maximum width of the form
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff", // Lighter color for the header text
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    color: "#fff", // Lighter text color in inputs
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    paddingLeft: 12,
    fontSize: 16,
    backgroundColor: "#333", // Darker background for inputs
    width: "100%", // Make the input fill its container
  },
  passwordContainer: {
    position: "relative",
    width: "100%", // Make the password container fill the available space
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
    color: "#fff", // Ensure icon is visible with a white color
  },
});

export default LoginForm;
