import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  type User = {
    id: number;
    username: string;
    email: string;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const router = useRouter(); // ✅ Correct Expo Router navigation

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/users");
      const data: User[] = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
      setLoading(false);
    }, 500);
  };

  const handleUserPress = (userId: number) => {
    router.push({
      pathname: "/userProfile/[userId]",
      params: { userId: userId.toString() }, // Fix: Convert number to string
    });
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#A0A0A0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#29ffa4"
            style={styles.loader}
          />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 50 }}
            ListEmptyComponent={
              <Text style={styles.noResults}>No users found</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userContainer}
                onPress={() => handleUserPress(item.id)}
              >
                <Text style={styles.username}>@{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  loader: {
    marginTop: 20,
  },
  userContainer: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  username: {
    fontWeight: "bold",
    color: "#29ffa4",
    fontSize: 16,
  },
  email: {
    color: "#fff",
    fontSize: 14,
    marginTop: 5,
  },
  noResults: {
    color: "#A0A0A0",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
