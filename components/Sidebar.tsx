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
import { Region } from "react-native-maps";

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

const Sidebar: React.FC<SidebarProps & { region: Region }> = ({
  visible,
  onClose,
  spots,
  onSpotSelect,
  region,
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

  if (!visible) return null;

  // Filter spots that are inside the current region
  const filteredSpots = spots.filter(
    (spot) =>
      spot.latitude >= region.latitude - region.latitudeDelta / 2 &&
      spot.latitude <= region.latitude + region.latitudeDelta / 2 &&
      spot.longitude >= region.longitude - region.longitudeDelta / 2 &&
      spot.longitude <= region.longitude + region.longitudeDelta / 2
  );

  const sections = groupSpotsBySecurityLevel(filteredSpots);

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
      {filteredSpots.length === 0 ? (
        <Text style={styles.noSpots}>No skate spots found in this region.</Text>
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
    width: "108%",
    height: "85%",
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
    fontFamily: "Courier New",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Courier New",
  },
  closeButton: {
    padding: 5,
  },
  noSpots: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Courier New",
    marginTop: 50,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    backgroundColor: "#29ffa4",
    alignSelf: "flex-start", // ensures the bg only spans the content
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontFamily: "Courier New",
    borderRadius: 12,
    marginTop: 10,
  },

  listContent: {
    paddingBottom: 20,
    fontFamily: "Courier New",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#292929",
    fontFamily: "Courier New",
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
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 12,
    fontFamily: "Courier New",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    fontFamily: "Courier New",
  },
  description: {
    fontSize: 14,
    fontFamily: "Courier New",
    color: "#aaa",
    marginTop: 4,
  },
});

export default Sidebar;
