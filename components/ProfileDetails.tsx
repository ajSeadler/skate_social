import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Avatar,
  IconButton,
  Modal,
  Portal,
  PaperProvider,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import profileStyles from "@/styles/profileStyles";
import PostForm from "@/components/PostForm";
import UserPosts from "@/components/UserPosts"; // Import the new UserPosts component

const API_URL = "http://localhost:5001";
const screenHeight = Dimensions.get("window").height; // Get the screen height

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  handleLogout,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userPosts, setUserPosts] = useState([]); // Store user's posts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName
      .charAt(0)
      .toUpperCase()}`;
  };

  // Fetch the user's posts
  const fetchUserPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/my-posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setUserPosts(data.posts);
    } catch (error) {
      console.error("❌ Error fetching user posts:", error);
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  // This is the callback function to be passed to the PostForm component
  const handlePostCreated = () => {
    // After a post is created, fetch the latest posts again
    fetchUserPosts();
  };

  return (
    <PaperProvider>
      <SafeAreaView style={profileStyles.safeAreaContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={[
              profileStyles.scrollViewContent,
              { paddingBottom: 100 },
            ]}
          >
            <View style={profileStyles.editProfile}>
              <IconButton
                icon="dots-horizontal"
                size={24}
                iconColor="white"
                onPress={() => setModalVisible(true)} // Show modal on press
              />
            </View>
            <View style={profileStyles.profileHeader}>
              {profile.profile_picture ? (
                <Avatar.Image
                  size={170}
                  source={{ uri: profile.profile_picture }}
                  style={profileStyles.profileImage}
                />
              ) : (
                <Avatar.Text
                  size={100}
                  label={getInitials(profile.first_name, profile.last_name)}
                  style={profileStyles.profileImage}
                />
              )}

              <View style={profileStyles.headerRow}>
                <Text style={profileStyles.username}>@{profile.username}</Text>

                {/* IconButton for three horizontal dots */}
              </View>
            </View>

            <View style={profileStyles.profileCard}>
              <View style={profileStyles.detailsRow}>
                <Ionicons name="person" size={20} color="#fff" />
                <Text style={profileStyles.detailsValue}>
                  {profile.first_name} {profile.last_name}
                </Text>
              </View>
              <View style={profileStyles.detailsRow}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={profileStyles.detailsValue}>
                  {profile.location || "N/A"}
                </Text>
              </View>
              <View style={profileStyles.detailsRow}>
                <Ionicons name="mail" size={20} color="#fff" />
                <Text style={profileStyles.detailsValue}>
                  {profile.email || "N/A"}
                </Text>
              </View>
            </View>

            <View style={profileStyles.postFormContainer}>
              <PostForm onPostCreated={handlePostCreated} />
            </View>

            {/* Render UserPosts component here */}
            <UserPosts
              userPosts={userPosts}
              loading={loading}
              error={error}
              fetchUserPosts={fetchUserPosts}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal for the three horizontal dots */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)} // Close modal on dismiss
            contentContainerStyle={{
              backgroundColor: "white",
              padding: 20,
              marginHorizontal: 20,
              borderRadius: 10,
              position: "absolute",
              bottom: 60, // Adjust the bottom position to account for the tab bar height
              left: 0,
              right: 0,
              marginBottom: 20, // Add some space from the bottom
              elevation: 10, // Add shadow to make it pop
            }}
          >
            <View style={{ alignItems: "flex-start", paddingVertical: 20 }}>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
              >
                Settings
              </Text>

              {/* Regular settings options */}
              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Change Username</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Change Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Change Password</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Manage Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Privacy Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Account Preferences</Text>
              </TouchableOpacity>

              {/* Logout option with different styling */}
              <TouchableOpacity
                style={[styles.logoutButton, { marginTop: 20 }]} // Special styling for logout
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>

              {/* Cancel option */}
              <TouchableOpacity
                onPress={() => setModalVisible(false)} // Close modal on cancel
                style={{ marginTop: 10, padding: 10, alignItems: "center" }}
              >
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

// Style for the menu options
const styles = StyleSheet.create({
  menuOptionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "flex-start", // Align text to the left for a more professional look
    justifyContent: "flex-start",
    marginBottom: 12,
    borderBottomWidth: 1, // Add a subtle bottom border for separation
    borderBottomColor: "#E1E1E1", // Soft gray border to give a clean, professional look
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: "500", // Slightly lighter weight for better legibility
    color: "#333", // Standard dark text color
  },
  logoutButton: {
    backgroundColor: "#FF4F4F", // Red background for the logout button
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20, // Ensures button doesn’t stretch edge-to-edge
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600", // Bold for emphasis
    color: "white", // White text for logout button
  },
});

export default ProfileDetails;
