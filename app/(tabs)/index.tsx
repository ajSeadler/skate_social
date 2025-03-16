import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import profileStyles from "@/styles/profileStyles";
import HomeScreen from "@/components/HomeScreen";
import ProfileDetails from "@/components/ProfileDetails"; // ✅ Import the new component

const API_URL = "http://localhost:5001";

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenFound, setTokenFound] = useState(true);
  const router = useRouter();

  // Fetch Profile Data
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setTokenFound(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem("token");
          setTokenFound(false);
          setProfile(null);
          router.replace("/");
          return;
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch profile");
        }
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

  // Handle Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setProfile(null);
      setTokenFound(false);
      router.replace("/");
    } catch (err) {
      setError("Error logging out");
    }
  };

  if (!tokenFound) return <HomeScreen />;

  if (loading) {
    return (
      <SafeAreaView
        style={profileStyles.safeAreaContainer}
        contentInsetAdjustmentBehavior="automatic"
      >
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

  if (error) return <Text style={profileStyles.errorText}>{error}</Text>;

  return <ProfileDetails profile={profile} handleLogout={handleLogout} />;
};

export default ProfileScreen;
