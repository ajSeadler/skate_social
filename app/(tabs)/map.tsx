import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
} from "react-native";
import MapView, { Marker, Region, MapEvent } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import CitySearch from "@/components/CitySearch";
import Sidebar from "@/components/Sidebar";
import debounce from "lodash.debounce";
import Animated from "react-native-reanimated";
import { fetchSkateSpots, addSkateSpot } from "@/hooks/api"; // ✅ Import API functions
import SpotDetailsModal from "@/components/SpotDetailsModal"; // ✅ Import the new modal component

// Define types for skate spot data
export interface SkateSpot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url: string;
  security_level: string;
}

const SkateSpotMap: React.FC = () => {
  const mapViewRef = useRef<MapView | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 35.4676,
    longitude: -97.5164,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [newSpot, setNewSpot] = useState<SkateSpot>({
    id: 0,
    name: "",
    description: "",
    latitude: 0,
    longitude: 0,
    image_url: "",
    security_level: "",
  });
  const [selectedSpot, setSelectedSpot] = useState<SkateSpot | null>(null);
  const [spotModalVisible, setSpotModalVisible] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      if (isMounted) {
        setRegion((prev) => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      }

      const fetchedSpots = await fetchSkateSpots();
      if (isMounted) setSpots(fetchedSpots);
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Open spot details modal when a marker is pressed
  const handleMarkerPress = (spot: SkateSpot) => {
    setSelectedSpot(spot);
    setSpotModalVisible(true);
    mapViewRef.current?.animateToRegion(
      {
        latitude: spot.latitude,
        longitude: spot.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  const handleSpotSelect = (spot: SkateSpot) => {
    setSidebarVisible(false);
    handleMarkerPress(spot);
  };

  const getSecurityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return "green";
      case "medium":
        return "orange";
      case "high":
        return "red";
      default:
        return "gray";
    }
  };

  const handleAddSpot = async () => {
    const addedSpot = await addSkateSpot(newSpot);
    if (addedSpot && addedSpot.spot) {
      setSpots((prevSpots) => [...prevSpots, addedSpot.spot]);
      setFormVisible(false);
      setNewSpot({
        id: 0,
        name: "",
        description: "",
        latitude: 0,
        longitude: 0,
        image_url: "",
        security_level: "",
      });
    }
  };

  const handleLongPress = useCallback((event: MapEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("Long press detected at:", latitude, longitude);
    setNewSpot((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
    setFormVisible(true);
  }, []);

  const handleCitySelect = (latitude: number, longitude: number) => {
    const newRegion = {
      latitude,
      longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setRegion(newRegion);
    mapViewRef.current?.animateToRegion(newRegion, 1000);
  };

  const prevRegion = useRef(region);

  // Wrap the debounced function in useCallback
  const handleRegionChangeComplete = useCallback(
    debounce(async (newRegion: Region) => {
      const newSpots = await fetchSkateSpots(
        newRegion.latitude,
        newRegion.longitude
      );
      setSpots(newSpots); // Replace previous spots instead of appending
      setRegion(newRegion);
    }, 1000),
    []
  );

  // Cancel the debounced function on component unmount
  useEffect(() => {
    return () => {
      handleRegionChangeComplete.cancel();
    };
  }, [handleRegionChangeComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <CitySearch onCitySelect={handleCitySelect} />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.sidebarToggle}
          onPress={() => setSidebarVisible(!sidebarVisible)}
        >
          <Text style={styles.toggleText}>Spots Near Me</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebarContainer,
          { transform: [{ translateX: sidebarVisible ? 0 : 300 }] },
        ]}
      >
        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          spots={spots}
          onSpotSelect={handleSpotSelect}
          region={region} // Pass the current region
        />
      </Animated.View>

      {/* Map */}
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        onLongPress={handleLongPress}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            onPress={() => handleMarkerPress(spot)}
          />
        ))}
      </MapView>

      {/* Modal for Adding New Skate Spot */}
      <Modal visible={formVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add New Skate Spot</Text>

            {/* Name Input */}
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#ccc"
              value={newSpot.name}
              onChangeText={(text) =>
                setNewSpot((prev) => ({ ...prev, name: text }))
              }
            />

            {/* Description Input */}
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#ccc"
              value={newSpot.description}
              onChangeText={(text) =>
                setNewSpot((prev) => ({ ...prev, description: text }))
              }
            />

            {/* Image URL Input */}
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              placeholderTextColor="#ccc"
              value={newSpot.image_url}
              onChangeText={(text) =>
                setNewSpot((prev) => ({ ...prev, image_url: text }))
              }
            />

            {/* Security Level Buttons */}
            <View style={styles.securityButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.securityButton,
                  newSpot.security_level === "low" &&
                    styles.selectedSecurityButton,
                ]}
                onPress={() =>
                  setNewSpot((prev) => ({ ...prev, security_level: "low" }))
                }
              >
                <Text style={styles.securityButtonText}>low</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.securityButton,
                  newSpot.security_level === "medium" &&
                    styles.selectedSecurityButton,
                ]}
                onPress={() =>
                  setNewSpot((prev) => ({ ...prev, security_level: "medium" }))
                }
              >
                <Text style={styles.securityButtonText}>medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.securityButton,
                  newSpot.security_level === "high" &&
                    styles.selectedSecurityButton,
                ]}
                onPress={() =>
                  setNewSpot((prev) => ({ ...prev, security_level: "high" }))
                }
              >
                <Text style={styles.securityButtonText}>high</Text>
              </TouchableOpacity>
            </View>

            {/* Time of Day Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Best Time of Day</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Morning, Afternoon, Evening"
                placeholderTextColor="#ccc"
                value={newSpot.best_time_of_day}
                onChangeText={(text) =>
                  setNewSpot((prev) => ({ ...prev, best_time_of_day: text }))
                }
              />
            </View>

            {/* Obstacles Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Obstacles</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rails, Ledges, Stairs"
                placeholderTextColor="#ccc"
                value={newSpot.obstacles}
                onChangeText={(text) =>
                  setNewSpot((prev) => ({ ...prev, obstacles: text }))
                }
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleAddSpot}
                style={styles.addButton}
              >
                <Text style={styles.buttonText}>Add Spot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFormVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Spot Details Modal */}
      <SpotDetailsModal
        visible={spotModalVisible}
        spot={selectedSpot}
        onClose={() => setSpotModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  sidebarToggle: {
    position: "absolute",
    bottom: 100,
    left: 20,
    backgroundColor: "#29ffa4",
    padding: 10,
    borderRadius: 8,
  },
  searchContainer: {
    position: "absolute",
    top: 30,
    left: 20,
    right: 20,
    zIndex: 10,
    borderRadius: 8,
    padding: 10,
  },
  sidebarContainer: {
    position: "absolute",
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    zIndex: 99999,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 15,
  },
  toggleContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 20,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 1.2,
    textAlign: "center",
    fontFamily: "Courier New",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "90%",
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: "Courier New",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    fontFamily: "Courier New",
    color: "#fff",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  securityButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  securityButton: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  selectedSecurityButton: {
    backgroundColor: "#29ffa4",
  },
  securityButtonText: {
    textTransform: "lowercase",
    fontWeight: "600",
    fontFamily: "Courier New",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    backgroundColor: "#29ffa4",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
    fontFamily: "Courier New",
  },
});

export default React.memo(SkateSpotMap);
