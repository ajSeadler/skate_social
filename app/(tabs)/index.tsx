import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons"; // Icon imports
import profileStyles from "@/styles/profileStyles";

import PostForm from "@/components/PostForm";
import HomeScreen from "@/components/HomeScreen";

const API_URL = "http://localhost:5001";

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenFound, setTokenFound] = useState(true); // State to track token presence
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setTokenFound(false); // If no token, set tokenFound to false
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch profile");
      } else {
        const data = await response.json();
        setProfile(data);
      }
    } catch (err) {
      setError("Error fetching profile data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setProfile(null);
      setTokenFound(false); // Set tokenFound to false after logout
      setLoading(true); // Ensure the loading state is set before routing
      router.replace("/"); // Redirect to the HomeScreen
    } catch (err) {
      setError("Error logging out");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName
      .charAt(0)
      .toUpperCase()}`;
  };

  if (!tokenFound) {
    return <HomeScreen />; // If no token, show HomeScreen (login/register)
  }

  if (loading) {
    return (
      <SafeAreaView style={profileStyles.safeAreaContainer}>
        <LinearGradient
          colors={["#0f0c29", "#302b63", "#24243e"]}
          style={profileStyles.gradient}
        >
          <ScrollView contentContainerStyle={profileStyles.scrollViewContent}>
            <View style={profileStyles.center}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={profileStyles.loadingText}>Loading...</Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={profileStyles.safeAreaContainer}>
        <LinearGradient
          colors={["#0f0c29", "#302b63", "#24243e"]}
          style={profileStyles.gradient}
        >
          <ScrollView contentContainerStyle={profileStyles.scrollViewContent}>
            <View style={profileStyles.center}>
              <Text style={profileStyles.errorText}>{error}</Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={profileStyles.safeAreaContainer}>
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        style={profileStyles.gradient}
      >
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
            <View style={profileStyles.profileHeader}>
              {profile.profile_picture ? (
                <Avatar.Image
                  size={120}
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
              <Text style={profileStyles.username}>@{profile.username}</Text>
            </View>

            <View style={profileStyles.profileCard}>
              <View style={profileStyles.detailsRow}>
                <Ionicons name="person" size={20} color="#fff" />
                <Text style={profileStyles.detailsLabel}></Text>
                <Text style={profileStyles.detailsValue}>
                  {profile.first_name} {profile.last_name}
                </Text>
              </View>
              {/* <View style={profileStyles.detailsRow}>
                <Ionicons name="calendar" size={20} color="#fff" />
                <Text style={profileStyles.detailsLabel}></Text>
                <Text style={profileStyles.detailsValue}>
                  {profile.age || "N/A"}
                </Text>
              </View> */}
              <View style={profileStyles.detailsRow}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={profileStyles.detailsLabel}></Text>
                <Text style={profileStyles.detailsValue}>
                  {profile.location || "N/A"}
                </Text>
              </View>
              <View style={profileStyles.detailsRow}>
                <Ionicons name="mail" size={20} color="#fff" />
                <Text style={profileStyles.detailsLabel}></Text>
                <Text style={profileStyles.detailsValue}>
                  {profile.email || "N/A"}
                </Text>
              </View>
            </View>

            <View style={profileStyles.postFormContainer}>
              <PostForm />
            </View>
            <View style={profileStyles.logoutContainer}>
              <TouchableOpacity
                style={profileStyles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={profileStyles.logoutButtonText}>
                  Hit The Streets
                </Text>
                <FontAwesome name="sign-out" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfileScreen;
