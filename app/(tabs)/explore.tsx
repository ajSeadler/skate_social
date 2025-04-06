import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Text,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons
import { BlurView } from "expo-blur";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const { width, height } = Dimensions.get("window");

export default function TabTwoScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("topPosts"); // Track active tab

  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
      if (!storedToken) {
        setIsOverlayVisible(true);
      }
    } catch (err) {
      console.error("Error retrieving token", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5001/posts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err) {
      setError("Error loading posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getToken();
    fetchPosts();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
  }, []);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {/* Header with Icons */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleTabPress("topPosts")}
        >
          <Ionicons
            name="flame"
            size={28}
            color={activeTab === "topPosts" ? "#29ffa4" : "#fff"} // Active color
          />
          <Text
            style={[
              styles.iconLabel,
              { color: activeTab === "topPosts" ? "#29ffa4" : "#fff" }, // Active color
            ]}
          >
            Top Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleTabPress("trending")}
        >
          <Ionicons
            name="trending-up"
            size={28}
            color={activeTab === "trending" ? "#29ffa4" : "#fff"} // Active color
          />
          <Text
            style={[
              styles.iconLabel,
              { color: activeTab === "trending" ? "#29ffa4" : "#fff" }, // Active color
            ]}
          >
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ffffff"
          />
        }
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <ThemedView key={post.id} style={styles.postContainer}>
              <ThemedText type="defaultSemiBold" style={styles.username}>
                @{post.username}
              </ThemedText>
              <ThemedText style={styles.content}>{post.content}</ThemedText>
              {post.image_url && (
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                />
              )}
              <ThemedText style={styles.timestamp}>
                {new Date(post.created_at).toLocaleString()}
              </ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedText style={styles.noPosts}>No posts available</ThemedText>
        )}
      </ScrollView>

      {isOverlayVisible && (
        <BlurView intensity={50} tint="dark" style={styles.overlay}>
          <ThemedText style={styles.overlayText}>
            Please create an account to view awesome skate content.
          </ThemedText>
        </BlurView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  scrollView: {
    paddingBottom: 70,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
    paddingBottom: 80,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "transparent",
    width: width,
  },
  titleText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    // fontFamily: "Courier New",
    textAlign: "center",
    letterSpacing: 3,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
  },
  postContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: width * 0.9,
  },
  username: {
    fontWeight: "900",
    color: "#fff",
    textAlign: "left",
    // fontFamily: "Courier New",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontSize: 20,
    marginBottom: 5,
  },
  content: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    // fontFamily: "Courier New",
    textAlign: "left",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  timestamp: {
    marginTop: 8,
    fontSize: 12,
    color: "#A0A0A0",
    // fontFamily: "Courier New",
  },
  noPosts: {
    color: "#A0A0A0",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Courier New",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayText: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
  },
  iconLabel: {
    fontSize: 14,
    marginTop: 5,
    // fontFamily: "Courier New",
  },
});
