import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";

// Define types for skate spot data
interface SkateSpot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

const SkateSpotMap: React.FC = () => {
  // Fix region state typing: Region type or null initially
  const [region, setRegion] = useState<Region | null>(null);
  const [spots, setSpots] = useState<SkateSpot[]>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      fetchSkateSpots(); // Fetch spots from backend
    })();
  }, []);

  const fetchSkateSpots = async () => {
    try {
      const response = await fetch("http://localhost:5001/skate-spots");
      const data = await response.json();
      setSpots(data.spots);
    } catch (error) {
      console.error("Error fetching skate spots:", error);
    }
  };

  return (
    <View style={styles.container}>
      {region ? (
        // Update to use region dynamically
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{
                latitude: spot.latitude,
                longitude: spot.longitude,
              }}
              title={spot.name}
              description={spot.description}
            >
              <Callout>
                <Text>{spot.name}</Text>
                <Text>{spot.description}</Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
});

export default SkateSpotMap;
