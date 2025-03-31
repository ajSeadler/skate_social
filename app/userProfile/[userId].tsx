import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams(); // Get userId from route params
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5001/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [userId]);

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.username}>@{user.username}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.createdAt}>Joined: {user.created_at}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
    padding: 20,
  },
  username: {
    fontWeight: "bold",
    color: "#29ffa4",
    fontSize: 24,
  },
  email: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  createdAt: {
    color: "#A0A0A0",
    fontSize: 14,
    marginTop: 5,
  },
});
