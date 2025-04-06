import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Region, MapEvent } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import CitySearch from "@/components/CitySearch";
import Sidebar from "@/components/Sidebar";
import debounce from "lodash.debounce";
import Animated from "react-native-reanimated";
import { fetchSkateSpots, addSkateSpot } from "@/hooks/api";
import SpotDetailsModal from "@/components/SpotDetailsModal";

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
  const [mapLoaded, setMapLoaded] = useState(false);
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
  const [loading, setLoading] = useState(false);

  const loadMap = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading delay
    setMapLoaded(true);
    setLoading(false);
  };

  useEffect(() => {
    if (!mapLoaded) return;

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
  }, [mapLoaded]);

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

  const handleLongPress = useCallback((event: MapEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
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

  const handleRegionChangeComplete = useCallback(
    debounce(async (newRegion: Region) => {
      const newSpots = await fetchSkateSpots(
        newRegion.latitude,
        newRegion.longitude
      );
      setSpots(newSpots);
      setRegion(newRegion);
    }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      handleRegionChangeComplete.cancel();
    };
  }, [handleRegionChangeComplete]);

  if (!mapLoaded) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.loadButton} onPress={loadMap}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.loadButtonText}>Load Map</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

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
          region={region}
        />
      </Animated.View>

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

      <SpotDetailsModal
        visible={spotModalVisible}
        spot={selectedSpot}
        onClose={() => setSpotModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  },
  loadButton: {
    backgroundColor: "#29ffa4",
    padding: 15,
    borderRadius: 10,
  },
  loadButtonText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
  },
});

export default React.memo(SkateSpotMap);
