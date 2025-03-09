import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur"; // Import BlurView
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const { width, height } = Dimensions.get("window");

export default function TabTwoScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);

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
    }
  };

  useEffect(() => {
    getToken();
    fetchPosts();
  }, []);

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
    <View style={styles.safeAreaContainer}>
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          style={styles.scrollView}
        >
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={styles.titleText}>
              sesh.
            </ThemedText>
          </ThemedView>

          {posts.length > 0 ? (
            posts.map((post) => (
              <ThemedView key={post.id} style={styles.postContainer}>
                <ThemedText type="defaultSemiBold" style={styles.username}>
                  {post.username}
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

        {/* Blurred Overlay */}
        {isOverlayVisible && (
          <BlurView intensity={50} tint="dark" style={styles.overlay}>
            <ThemedText style={styles.overlayText}>
              Please create an account to view awesome skate content.
            </ThemedText>
          </BlurView>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    paddingBottom: 70,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingBottom: 80,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    width: width,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "left",
    fontFamily: "Urbanist_700Bold",
    letterSpacing: 2,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
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
    borderRadius: 8,
    backgroundColor: "rgba(35, 35, 35, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: width * 0.9,
  },
  username: {
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  content: {
    color: "#E0E0E0",
    marginBottom: 10,
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
  },
  noPosts: {
    color: "#A0A0A0",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Makes the overlay cover the entire screen
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
  button: {
    padding: 12,
    backgroundColor: "#FF5733",
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
