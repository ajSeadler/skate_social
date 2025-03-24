import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Image,
  Animated,
  Dimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

interface SkateSpot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url: string;
  security_level: string;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  spots: SkateSpot[];
  onSpotSelect: (spot: SkateSpot) => void;
}

// Helper: group spots by security level (or any other category)
const groupSpotsBySecurityLevel = (spots: SkateSpot[]) => {
  const groups: { [key: string]: SkateSpot[] } = {};
  spots.forEach((spot) => {
    const key = spot.security_level.toLowerCase();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(spot);
  });
  return Object.keys(groups).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1) + " Security",
    data: groups[key],
  }));
};

const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  spots,
  onSpotSelect,
}) => {
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible && slideAnim._value === Dimensions.get("window").height)
    return null;

  const sections = groupSpotsBySecurityLevel(spots);

  return (
    <Animated.View
      style={[styles.sidebar, { transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spots Near Me</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      {spots.length === 0 ? (
        <Text style={styles.noSpots}>No skate spots found.</Text>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSpotSelect(item)}
            >
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Animated.View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%", // Ensure full width
    height: "80%",
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 70,
    zIndex: 10,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  closeButton: {
    padding: 5,
  },
  noSpots: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    marginTop: 50,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#F46036",
    alignSelf: "flex-start", // ensures the bg only spans the content
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 10,
  },

  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#292929",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  description: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
});

export default Sidebar;
