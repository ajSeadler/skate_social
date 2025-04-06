import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Card, Title, Paragraph, Text, Divider } from "react-native-paper";

interface SpotsSkatedCardProps {
  token: string;
}

interface SkateSpot {
  id: number;
  name: string;
  // include other properties if needed
}

const SpotsSkatedCard: React.FC<SpotsSkatedCardProps> = ({ token }) => {
  const [favorites, setFavorites] = useState<SkateSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the user's favorite skate spots from localhost:5001
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch("http://localhost:5001/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setFavorites(data.favorites || []);
        } else {
          console.error("Error fetching favorites:", data.error);
        }
      } catch (error) {
        console.error("Fetch favorites error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchFavorites();
    }
  }, [token]);

  if (loading) {
    return (
      <Card style={styles.spotsCard} elevation={4}>
        <Card.Content style={styles.cardContent}>
          <ActivityIndicator size="large" color="#29ffa4" />
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.spotsCard} elevation={4}>
      <Card.Content style={styles.cardContent}>
        <Title style={styles.spotsTitle}>Favorite Spots</Title>
        <Paragraph style={styles.spotsNumber}>{favorites.length}</Paragraph>
        <Divider style={styles.divider} />
        <View style={styles.spotsContainer}>
          <Text style={styles.sectionTitle}>Recent Favorites</Text>
          {favorites.length > 0 ? (
            favorites.map((spot, index) => (
              <Text key={index} style={styles.spotText}>
                {spot.name}
              </Text>
            ))
          ) : (
            <Text style={styles.spotText}>No favorite spots yet.</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  spotsCard: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    marginVertical: 10,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardContent: {
    paddingTop: 10,
  },
  spotsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#29ffa4",
  },
  spotsNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    lineHeight: 34,
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 1,
    marginVertical: 8,
  },
  spotsContainer: {
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  spotText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#29ffa4",
    marginBottom: 4,
  },
});

export default SpotsSkatedCard;
