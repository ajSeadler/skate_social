import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-paper";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import profileStyles from "@/styles/profileStyles";

interface ProfileCardProps {
  profile: {
    first_name: string;
    last_name: string;
    username: string;
    profile_picture?: string;
    age?: number;
    location?: string;
    email?: string;
  };
  handleLogout: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, handleLogout }) => {
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;

  return (
    <View>
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
          <Text style={profileStyles.detailsLabel}>Full Name:</Text>
          <Text style={profileStyles.detailsValue}>
            {profile.first_name} {profile.last_name}
          </Text>
        </View>
        <View style={profileStyles.detailsRow}>
          <Ionicons name="calendar" size={20} color="#fff" />
          <Text style={profileStyles.detailsLabel}>Age:</Text>
          <Text style={profileStyles.detailsValue}>{profile.age || "N/A"}</Text>
        </View>
        <View style={profileStyles.detailsRow}>
          <Ionicons name="location" size={20} color="#fff" />
          <Text style={profileStyles.detailsLabel}>Location:</Text>
          <Text style={profileStyles.detailsValue}>
            {profile.location || "N/A"}
          </Text>
        </View>
        <View style={profileStyles.detailsRow}>
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={profileStyles.detailsLabel}>Email:</Text>
          <Text style={profileStyles.detailsValue}>
            {profile.email || "N/A"}
          </Text>
        </View>
        <View style={profileStyles.detailsRow}>
          <TouchableOpacity
            style={profileStyles.logoutButton}
            onPress={handleLogout}
          >
            <FontAwesome name="sign-out" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;
