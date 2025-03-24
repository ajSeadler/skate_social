import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  NativeSyntheticEvent,
  LayoutChangeEvent,
  TextInput,
  Button,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import CitySearchBar from "@/components/CitySearch";
import Sidebar from "@/components/Sidebar";

// Define types for skate spot data
interface SkateSpot {
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
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 35.4676,
    longitude: -97.5164,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(0.05);
  const [scrollViewWidth, setScrollViewWidth] = useState<number>(0);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
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

  // Helper to filter spots based on the current region
  const getVisibleSpots = (spots: SkateSpot[], region: Region) => {
    const latMin = region.latitude - region.latitudeDelta / 2;
    const latMax = region.latitude + region.latitudeDelta / 2;
    const lonMin = region.longitude - region.longitudeDelta / 2;
    const lonMax = region.longitude + region.longitudeDelta / 2;

    return spots.filter(
      (spot) =>
        spot.latitude >= latMin &&
        spot.latitude <= latMax &&
        spot.longitude >= lonMin &&
        spot.longitude <= lonMax
    );
  };

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      // Get the current position
      let location = await Location.getCurrentPositionAsync({});
      if (location) {
        // Update region state with current location coordinates
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: zoomLevel,
          longitudeDelta: zoomLevel,
        });
      }

      // Fetch skate spots after location is obtained
      await fetchSkateSpots();
    })();
  }, []);

  const fetchSkateSpots = async () => {
    try {
      const response = await fetch("http://localhost:5001/skate-spots");
      const data = await response.json();
      if (data && Array.isArray(data.spots)) {
        setSpots(data.spots);
      } else {
        console.error("Fetched data does not contain an array of spots:", data);
      }
    } catch (error) {
      console.error("Error fetching skate spots:", error);
    }
  };

  const handleMarkerPress = (spot: SkateSpot) => {
    setSelectedSpotId(spot.id);
    const newRegion = {
      latitude: spot.latitude,
      longitude: spot.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapViewRef.current?.animateToRegion(newRegion, 1000);
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
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      const response = await fetch("http://localhost:5001/skate-spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSpot),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding spot:", errorData.error || "Unknown error");
        return;
      }
      const data = await response.json();
      if (data && data.spot) {
        setSpots((prevSpots) => [...prevSpots, data.spot]);
      }
      setFormVisible(false);
    } catch (error) {
      console.error("Error adding skate spot:", error);
    }
  };

  const handleLongPress = (event: NativeSyntheticEvent<LayoutChangeEvent>) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    if (latitude && longitude) {
      setNewSpot({
        ...newSpot,
        latitude,
        longitude,
      });
      setFormVisible(true);
    } else {
      console.error("Invalid coordinates");
    }
  };

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

  // Filter spots to only those in the current map region
  const visibleSpots = getVisibleSpots(spots, region);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <CitySearchBar onCitySelect={handleCitySelect} />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={styles.sidebarToggle}
          onPress={() => setSidebarVisible(!sidebarVisible)}
        >
          <Ionicons name="menu" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Sidebar Container */}
      <View
        style={styles.sidebarContainer}
        pointerEvents={sidebarVisible ? "auto" : "none"}
      >
        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          spots={visibleSpots} // Pass only the spots visible in the current region
          onSpotSelect={handleSpotSelect}
        />
      </View>

      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onLongPress={handleLongPress}
      >
        {visibleSpots.map((spot: SkateSpot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title={spot.name}
            description={spot.description}
            onPress={() => handleMarkerPress(spot)}
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{spot.name}</Text>
                <View style={{ alignItems: "center" }}>
                  <Image
                    source={{ uri: spot.image_url }}
                    style={styles.calloutImage}
                  />
                </View>
                <Text style={styles.calloutDescription}>
                  {spot.description}
                </Text>
                <Text
                  style={[
                    styles.securityLevel,
                    { color: getSecurityColor(spot.security_level) },
                  ]}
                >
                  <Ionicons
                    name="shield"
                    size={20}
                    color={getSecurityColor(spot.security_level)}
                  />
                  <Text style={styles.securityLevelText}>
                    {" "}
                    {spot.security_level}
                  </Text>
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.spotsListContainer}>
        {formVisible && (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Spot Name"
              placeholderTextColor={"#333"}
              value={newSpot.name}
              onChangeText={(text) => setNewSpot({ ...newSpot, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor={"#333"}
              value={newSpot.description}
              onChangeText={(text) =>
                setNewSpot({ ...newSpot, description: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Latitude"
              placeholderTextColor={"#333"}
              keyboardType="numeric"
              value={newSpot.latitude.toString()}
              onChangeText={(text) =>
                setNewSpot({ ...newSpot, latitude: parseFloat(text) })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Longitude"
              placeholderTextColor={"#333"}
              keyboardType="numeric"
              value={newSpot.longitude.toString()}
              onChangeText={(text) =>
                setNewSpot({ ...newSpot, longitude: parseFloat(text) })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL"
              placeholderTextColor={"#333"}
              value={newSpot.image_url}
              onChangeText={(text) =>
                setNewSpot({ ...newSpot, image_url: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Security Level (low/medium/high)"
              placeholderTextColor={"#333"}
              value={newSpot.security_level}
              onChangeText={(text) =>
                setNewSpot({ ...newSpot, security_level: text.toLowerCase() })
              }
            />
            <Button title="Add Spot" onPress={handleAddSpot} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: "absolute",
    top: 30,
    left: 20,
    right: 20,
    zIndex: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 3,
  },
  toggleContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    zIndex: 20,
  },
  sidebarToggle: {
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  sidebarContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "80%",
    zIndex: 15,
  },
  spotsListContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    padding: 10,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  calloutContainer: {
    width: 200,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  calloutImage: {
    width: 150,
    height: 100,
    marginTop: 5,
  },
  calloutDescription: {
    color: "#555",
    marginTop: 5,
  },
  securityLevel: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
    padding: 5,
  },
  securityLevelText: {},
});

export default SkateSpotMap;
