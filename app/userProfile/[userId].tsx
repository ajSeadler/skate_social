import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SpotsSkatedCard from "@/components/SpotsSkatedCard";

const API_URL = "http://localhost:5001";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams();
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        const response = await fetch(`${API_URL}/users/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user profile.");

        const data = await response.json();
        console.log("Fetched user data:", data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    if (user) {
      navigation.setOptions({ title: `@${user.username}` });
    }
  }, [navigation, user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Image
            source={{ uri: user.profile_picture }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>@{user.username}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>500</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>300</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsValue}>{user.bio}</Text>
          </View>
          <Text style={styles.detailsTitle}>Details</Text>
          <View style={styles.detailsRow}>
            <Ionicons name="location-outline" size={24} color="#999" />
            <Text style={styles.detailsText}>{user.location || "N/A"}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Ionicons name="calendar-outline" size={24} color="#999" />
            <Text style={styles.detailsText}>
              Member Since: {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </View>
          <SpotsSkatedCard />
        </View>

        {/* Optional section for user posts, skating spots, etc. */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: "row",
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: "#ddd",
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  statItem: {
    marginRight: 15,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
  },
  detailsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailsValue: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 12,
    fontFamily: "Inter",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  detailsText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#555",
  },
});
