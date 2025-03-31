import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

interface CitySearchProps {
  onCitySelect: (latitude: number, longitude: number) => void;
}

const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState("");

  const searchCity = async () => {
    if (!query.trim()) return;

    const abortController = new AbortController();

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
        { signal: abortController.signal }
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        onCitySelect(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch request was aborted");
      } else {
        console.error("Error fetching city data:", error);
      }
    }

    return () => abortController.abort();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a city..."
        placeholderTextColor="#ccc"
        value={query}
        onChangeText={setQuery}
      />
      <TouchableOpacity style={styles.button} onPress={searchCity}>
        <Text style={styles.buttonText}>Go</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 30, 0.8)",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 10, // Make sure it is on top of other elements
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#1f1f2e",
    fontFamily: "Courier New",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#29ffa4",
    marginLeft: 10,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 99999, // Ensure it's above other elements
  },
  buttonText: {
    color: "#000",
    fontFamily: "Courier New",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CitySearch;
