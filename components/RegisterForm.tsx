import React, { useState } from "react";
import {
  TextInput,
  Button,
  StyleSheet,
  Alert,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For password visibility toggle

const API_URL = "http://localhost:5001"; // Your backend API URL

interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio: string;
  age: string;
  location: string;
  profilePicture: string;
}

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    bio: "",
    age: "",
    location: "",
    profilePicture: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          first_name: form.firstName, // Convert the field names here
          last_name: form.lastName,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Registration Successful", "You can now log in");
      } else {
        Alert.alert("Error", data.error);
      }
    } catch (error) {
      console.error("Error registering user", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.header}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={(username) => setForm({ ...form, username })}
        />
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
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={form.firstName}
          onChangeText={(firstName) => setForm({ ...form, firstName })}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={form.lastName}
          onChangeText={(lastName) => setForm({ ...form, lastName })}
        />
        <TextInput
          style={styles.input}
          placeholder="Bio"
          value={form.bio}
          onChangeText={(bio) => setForm({ ...form, bio })}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={form.age}
          onChangeText={(age) => setForm({ ...form, age })}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={form.location}
          onChangeText={(location) => setForm({ ...form, location })}
        />
        <TextInput
          style={styles.input}
          placeholder="Profile Picture URL"
          value={form.profilePicture}
          onChangeText={(profilePicture) =>
            setForm({ ...form, profilePicture })
          }
        />

        <Button title="Register" onPress={handleRegister} color="#4CAF50" />
      </View>
    </TouchableWithoutFeedback>
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
    color: "#fff",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    paddingLeft: 12,
    fontSize: 16,
    backgroundColor: "#333",
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
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    marginTop: 15,
  },
  labelDropdown: {
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
    marginBottom: 5,
    marginTop: 15,
  },
  pickerContainer: {
    width: "100%", // Ensure Picker takes the full width
    height: "-50%",
  },
  picker: {
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#333",
    width: "100%",
  },
});

export default RegisterForm;
