import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import SpotsSkatedCard from "./SpotsSkatedCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Avatar,
  Modal,
  Portal,
  Provider as PaperProvider,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import profileStyles from "@/styles/profileStyles";
import PostForm from "@/components/PostForm";
import UserPosts from "@/components/UserPosts";

const API_URL = "http://localhost:5001";
const screenHeight = Dimensions.get("window").height;

interface ProfileDetailsProps {
  profile: {
    profile_picture: string;
    username: string;
    bio: string;
    location: string;
    created_at: string;
    // Add any additional profile properties as needed
  };
  handleLogout: () => void;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({
  profile,
  handleLogout,
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Retrieve token from AsyncStorage on mount
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);
    };
    fetchToken();
  }, []);

  const fetchUserPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
  }, [token]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handlePostCreated = () => {
    fetchUserPosts();
    setPostModalVisible(false); // close post modal on successful post creation
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleMakePost = () => {
    setPostModalVisible(true);
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
            {/* Header with profile image, stats, and buttons */}
            <View style={styles.headerContainer}>
              <Avatar.Image
                size={100}
                source={{ uri: profile.profile_picture }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfoContainer}>
                <Text style={styles.username}>@{profile.username}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>12</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>500</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>300</Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </View>
                </View>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={styles.editProfileButton}
                    onPress={handleEditProfile}
                  >
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.makePostButton}
                    onPress={handleMakePost}
                  >
                    <Text style={styles.makePostText}>Make Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Profile Details Section */}
            <View style={profileStyles.profileCard}>
              <View style={styles.detailsRow}>
                <Text style={styles.detailsValue}>{profile.bio}</Text>
              </View>
              <View style={styles.detailsRow}>
                <Ionicons name="location-outline" size={24} color="#999" />
                <Text style={styles.detailsValue}>
                  {profile.location || "N/A"}
                </Text>
              </View>
              <View style={styles.detailsRow}>
                <Ionicons name="calendar-outline" size={24} color="#999" />
                <Text style={styles.createdAt}>
                  Member Since:{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </Text>
              </View>
              {/* Pass the token prop to SpotsSkatedCard only if token exists */}
              {token && <SpotsSkatedCard token={token} />}
            </View>

            {/* User Posts */}
            <UserPosts
              userPosts={userPosts}
              loading={loading}
              error={error}
              fetchUserPosts={fetchUserPosts}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <Portal>
          <Modal
            visible={editModalVisible}
            onDismiss={() => setEditModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Edit Profile</Text>
              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Edit Profile Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Change Username</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Update Bio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Change Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOptionButton}>
                <Text style={styles.menuOptionText}>Change Password</Text>
              </TouchableOpacity>
              <View style={styles.logoutContainer}>
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={{ color: "red" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        <Portal>
          <Modal
            visible={postModalVisible}
            onDismiss={() => setPostModalVisible(false)}
            contentContainerStyle={styles.modalContainerPost}
          >
            <View style={styles.modalContent}>
              <PostForm onPostCreated={handlePostCreated} />
              <TouchableOpacity
                onPress={() => setPostModalVisible(false)}
                style={styles.cancelButton}
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

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  profileImage: {
    marginRight: 20,
  },
  profileInfoContainer: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statItem: {
    alignItems: "center",
    marginRight: 15,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "#bbb",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  editProfileButton: {
    backgroundColor: "transparent",
    borderColor: "#29ffa4",
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  editProfileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  makePostButton: {
    backgroundColor: "#29ffa4",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  makePostText: {
    color: "#0F0F0F",
    fontSize: 16,
    fontWeight: "600",
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
  createdAt: {
    fontSize: 14,
    marginLeft: 5,
    color: "#A0A0A0",
  },
  modalContainer: {
    backgroundColor: "#212121",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    marginBottom: 20,
    elevation: 10,
  },
  modalContainerPost: {
    backgroundColor: "#222",
    borderRadius: 20,
  },
  modalContent: {
    alignItems: "flex-start",
    paddingVertical: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  menuOptionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
    alignItems: "center",
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
  },
  logoutButton: {
    backgroundColor: "#FF4F4F",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default ProfileDetails;
