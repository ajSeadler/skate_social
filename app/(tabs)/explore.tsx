import {
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient"; // or from react-native-linear-gradient

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const { width, height } = Dimensions.get("window"); // Get screen width and height

export default function TabTwoScreen() {
  const [posts, setPosts] = useState<any[]>([]); // State for storing posts
  const [loading, setLoading] = useState<boolean>(true); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for error handling

  // Function to fetch posts from API
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
      setPosts(data.posts); // Assuming the response contains a 'posts' key
    } catch (err) {
      setError("Error loading posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch posts on component mount
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
      {/* Linear Gradient without absoluteFillObject */}
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        style={styles.gradient} // Gradient as background
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          style={styles.scrollView} // Add scrollView style for padding adjustment
        >
          {/* Title container with transparent background */}
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1, // Allow full screen height
  },
  gradient: {
    flex: 1, // Ensures that gradient fills the screen properly
  },
  scrollView: {
    paddingBottom: 70, // Account for the tab bar height (adjust based on your tab bar's height)
  },
  scrollViewContent: {
    flexGrow: 1, // Ensures content can grow and fill up remaining space
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
    backgroundColor: "transparent", // Transparent background

    width: width, // Make sure it spans the entire width
  },
  titleText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "left",
    fontFamily: "Urbanist_700Bold", // Use a bold, modern font
    letterSpacing: 2, // Slight letter spacing for a clean look
    textShadowColor: "rgba(255, 255, 255, 0.3)", // Subtle glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10, // Soft shadow to make it pop
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
    width: width * 0.9, // Set the width to 90% of the screen
  },
  username: {
    fontWeight: "bold",
    color: "#FFFFFF", // White color for username
    marginBottom: 10,
  },
  content: {
    color: "#E0E0E0", // Lighter gray for post content
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
    color: "#A0A0A0", // Lighter gray for timestamp
  },
  noPosts: {
    color: "#A0A0A0", // Lighter gray for no posts text
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
