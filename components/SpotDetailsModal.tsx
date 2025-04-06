// SpotDetailsModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Updated SkateSpot type with additional fields
export interface SkateSpot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url: string;
  security_level: string;
  obstacles: string;
  best_time_of_day: string;
}

interface SpotDetailsModalProps {
  visible: boolean;
  spot: SkateSpot | null;
  onClose: () => void;
}

const SpotDetailsModal: React.FC<SpotDetailsModalProps> = ({
  visible,
  spot,
  onClose,
}) => {
  if (!spot) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{spot.name}</Text>
          <Image source={{ uri: spot.image_url }} style={styles.image} />
          <Text style={styles.description}>{spot.description}</Text>

          <View style={styles.infoRow}>
            <Ionicons
              name="construct-outline"
              size={30}
              color="#29ffa4"
              style={styles.icon}
            />
            <Text style={styles.infoText}>Obstacles: {spot.obstacles}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={30}
              color="#29ffa4"
              style={styles.icon}
            />
            <Text style={styles.infoText}>
              Best Time: {spot.best_time_of_day}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={30}
              color="#29ffa4"
              style={styles.icon}
            />
            <Text style={styles.infoText}>Security: {spot.security_level}</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons
              name="close-circle"
              size={24}
              color="#000"
              style={styles.closeIcon}
            />
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#222",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 350,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 250,
    marginBottom: 15,
    borderRadius: 10,
  },
  description: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
    textAlign: "justify",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    color: "#fff",
    fontSize: 18,
  },
  closeButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#29ffa4",
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
  },
  closeButtonText: {
    fontWeight: "600",
    color: "#000",
    fontSize: 18,
    marginLeft: 8,
  },
  closeIcon: {},
});

export default SpotDetailsModal;
