import React, { useState } from "react";
import {
  TextInput,
  Button,
  StyleSheet,
  Alert,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For password visibility toggle
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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
      <Text style={styles.header}>Welcome!</Text>
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
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]} // Blue to purple gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loginButton}
      >
        <TouchableOpacity
          onPress={handleLogin}
          style={styles.loginButtonContent}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </LinearGradient>
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
    borderRadius: 20,
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
  loginButton: {
    backgroundColor: "transparent", // Transparent background for a more minimalist look
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
    backgroundImage: "linear-gradient(to right, #6a11cb, #2575fc)", // Blue to purple gradient
  },

  loginButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff", // White text
    textAlign: "center",
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoginForm;
