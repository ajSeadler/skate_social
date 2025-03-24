import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

const NewSkateSpotForm: React.FC<{ onSpotAdded: () => void }> = ({
  onSpotAdded,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [securityLevel, setSecurityLevel] = useState("Low");

  const handleSubmit = async () => {
    if (!name || !latitude || !longitude) {
      Alert.alert("Error", "Name, latitude, and longitude are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/skate-spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_TOKEN_HERE`, // Replace with actual auth token
        },
        body: JSON.stringify({
          name,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          image_url: imageUrl,
          security_level: securityLevel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Skate spot added successfully!");
        onSpotAdded();
        setName("");
        setDescription("");
        setLatitude("");
        setLongitude("");
        setImageUrl("");
        setSecurityLevel("Low");
      } else {
        Alert.alert("Error", data.error || "Failed to add skate spot.");
      }
    } catch (error) {
      console.error("❌ Error adding skate spot:", error);
      Alert.alert("Error", "An error occurred while adding the skate spot.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Skate Spot</Text>
      <TextInput
        style={styles.input}
        placeholder="Spot Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        value={latitude}
        keyboardType="numeric"
        onChangeText={setLatitude}
      />
      <TextInput
        style={styles.input}
        placeholder="Longitude"
        value={longitude}
        keyboardType="numeric"
        onChangeText={setLongitude}
      />
      <TextInput
        style={styles.input}
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="Security Level (Low, Medium, High)"
        value={securityLevel}
        onChangeText={setSecurityLevel}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Skate Spot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default NewSkateSpotForm;
