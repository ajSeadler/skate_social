import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";

const CustomHeader = ({ title }: { title: string }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerTransparent: true,
        headerShadowVisible: false,
        header: ({ route, options }) => {
          const title = "sesh.";

          return (
            <View style={styles.headerWrapper}>
              {Platform.OS === "ios" ? (
                <BlurView intensity={80} style={styles.headerBlur}>
                  <CustomHeader title={title} />
                </BlurView>
              ) : (
                <View style={styles.androidHeader}>
                  <CustomHeader title={title} />
                </View>
              )}
            </View>
          );
        },
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
          },
          android: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 0,
            elevation: 4,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Skate Spots",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="location-pin" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    display: "none",
    width: "100%",
    height: 80, // Increased for better spacing
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  headerBlur: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  androidHeader: {
    width: "100%",
    height: 90,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent Android header
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 80,
    paddingTop: Platform.OS === "ios" ? 44 : 20, // Adjust for status bar
    marginLeft: 125, // Ensures title is pushed to the left
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900", // Boldest weight for maximum emphasis
    color: "#fff", // White text to contrast with the dark background
    textAlign: "center", // Center the text
    fontFamily: "Urbanist_700Bold", // Use a bold, modern font
    letterSpacing: 2, // Slight letter spacing for a clean look
    textShadowColor: "rgba(255, 255, 255, 0.4)", // Subtle glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10, // Soft shadow to make it pop
  },
});
