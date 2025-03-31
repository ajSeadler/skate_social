import AsyncStorage from "@react-native-async-storage/async-storage";

// api.ts
const API_URL = "http://localhost:5001";

export const fetchSkateSpots = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(`${API_URL}/skate-spots`);
    const data = await response.json();
    if (data && Array.isArray(data.spots)) {
      return data.spots;
    } else {
      console.error("Fetched data does not contain an array of spots:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching skate spots:", error);
    return [];
  }
};

export const addSkateSpot = async (spot: {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url: string;
  security_level: string;
}) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return null;
    }
    const response = await fetch(`${API_URL}/skate-spots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(spot),
    });
    if (!response.ok) {
      console.error("Error adding spot:", await response.json());
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding skate spot:", error);
    return null;
  }
};

export const fetchProfileData = async (token: string) => {
  const API_URL = "http://localhost:5001";
  try {
    const response = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }
    }

    return await response.json();
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Error fetching profile data"
    );
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};
