import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons"; // Importing FontAwesome icons
import { Ionicons } from "@expo/vector-icons";
import profileStyles from "@/styles/profileStyles";

interface UserPostsProps {
  userPosts: any[];
  loading: boolean;
  error: string | null;
  fetchUserPosts: () => void; // Function to refetch posts
}

const UserPosts: React.FC<UserPostsProps> = ({
  userPosts,
  loading,
  error,
  fetchUserPosts,
}) => {
  const [postsCount, setPostsCount] = useState<number>(0);

  // Fetch posts for the user
  const fetchPosts = async () => {
    try {
      console.log("Fetching user posts...");
      await fetchUserPosts(); // Call the function passed as a prop to fetch the posts
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Check the posts count when the component mounts
  const checkPostsCount = async () => {
    try {
      // Retrieve the total number of posts from AsyncStorage
      const storedPostCount = await AsyncStorage.getItem("totalPostsCount");
      setPostsCount(storedPostCount ? parseInt(storedPostCount) : 0);
    } catch (error) {
      console.error("Error retrieving posts count:", error);
    }
  };

  // Update the total posts count after a new post is made
  const updatePostsCount = async () => {
    try {
      const newPostCount = userPosts.length; // Use the actual length of posts
      setPostsCount(newPostCount);

      // Store the new post count in AsyncStorage
      await AsyncStorage.setItem("totalPostsCount", newPostCount.toString());
    } catch (error) {
      console.error("Error updating posts count:", error);
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch user posts when the component mounts
    checkPostsCount(); // Check the post count when the component mounts
  }, []);

  useEffect(() => {
    updatePostsCount(); // Update post count whenever userPosts change
  }, [userPosts]);

  // Log userPosts to verify the structure of the data
  console.log("User Posts:", userPosts);

  return (
    <View style={profileStyles.postsContainer}>
      <Text style={profileStyles.sectionTitle}>Clips and Posts</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : error ? (
        <Text style={profileStyles.errorText}>{error}</Text>
      ) : userPosts.length === 0 ? (
        <View>
          <Text style={profileStyles.noPostsText}>
            You haven't made any posts yet.
          </Text>
          <Button
            title="Go make your first post!"
            onPress={() => {
              /* Navigate to post creation screen */
            }}
          />
        </View>
      ) : (
        userPosts.map((post) => (
          <View key={post.id} style={profileStyles.postCard}>
            {/* Display the username of the poster */}
            <Text style={profileStyles.postUsername}>@{post.username}</Text>

            <Text style={profileStyles.postContent}>{post.content}</Text>
            {post.image_url && (
              <Image
                source={{ uri: post.image_url }}
                style={profileStyles.postImage}
              />
            )}
            <Text style={profileStyles.postDate}>
              {new Date(post.created_at).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

export default UserPosts;
