import { StyleSheet } from "react-native";

// Added contentContainerStyle for ScrollView and adjusted layout to allow scrolling
const profileStyles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  scrollViewContent: {
    flexGrow: 1, // This ensures the ScrollView content can grow and fill up remaining space
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  profileHeader: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "flex-start",
    marginBottom: 30,
  },
  username: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "left",
    fontFamily: "Urbanist_700Bold",
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 90,
    marginBottom: 30,
    borderWidth: 3,
    borderColor: "#ddd",
    backgroundColor: "#222",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileCard: {
    backgroundColor: "rgba(35, 35, 35, 0.5)",
    padding: 20,
    marginBottom: 0,
  },
  profileCardHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 5,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center", // Aligns the icon and text vertically
    marginBottom: 18,
  },
  detailsLabel: {
    fontSize: 18,
    color: "#ddd",
    fontWeight: "bold",
    fontFamily: "Helvetica Neue",
    width: "40%",
    marginLeft: 10, // Added space between the icon and the label
  },
  detailsValue: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
    fontFamily: "Helvetica Neue",
    flexShrink: 1, // Prevents overflow by shrinking text if necessary
    flexWrap: "wrap", // Allows wrapping of long text
  },
  logoutButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 5,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    color: "#4CAF50",
    marginTop: 15,
    fontFamily: "Helvetica Neue",
  },
  errorText: {
    fontSize: 20,
    color: "#FF6347",
    marginTop: 15,
    fontFamily: "Helvetica Neue",
  },
});

export default profileStyles;
