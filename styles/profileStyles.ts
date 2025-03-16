import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window"); // Get the screen width

// Added contentContainerStyle for ScrollView and adjusted layout to allow scrolling
const profileStyles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    marginTop: 20,
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
    alignItems: "center",
    marginBottom: 10,
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
    // backgroundColor: "rgba(35, 35, 35, 0.5)",
    padding: 20,
    width: "100%",
    borderBottomWidth: 2,
    borderBottomColor: "#666",
  },
  profileCardHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // This spreads elements apart
    width: "100%", // Ensures it takes full width
    marginTop: 10, // Adjust for spacing
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center", // Aligns the icon and text vertically
    marginBottom: 10,
  },
  detailsLabel: {
    fontSize: 18,
    color: "#ddd",
    fontWeight: "bold",
    fontFamily: "Helvetica Neue",
    marginLeft: 10, // Added space between the icon and the label
  },
  detailsValue: {
    fontSize: 18,
    color: "#fff",
    marginLeft: 1,
    fontWeight: "bold",
    fontFamily: "Helvetica Neue",
    flexShrink: 1, // Prevents overflow by shrinking text if necessary
    flexWrap: "wrap", // Allows wrapping of long text
  },

  logoutContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },

  logoutButton: {
    backgroundColor: "#E63946", // A professional red tone for logout
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30, // Rounded for a modern look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
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
  postsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "left",
    letterSpacing: 1.5,
  },

  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  streakText: {
    color: "#FFF", // Flame color for the streak text
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

  postCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(35, 35, 35, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: width * 0.9,
  },

  postUsername: {
    fontWeight: "900",
    color: "#fff",
    textAlign: "left",
    fontFamily: "Urbanist_700Bold",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 5,
  },

  postContent: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
    marginBottom: 10,
    textAlign: "justify",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "cover",
  },
  postDate: {
    fontSize: 12,
    color: "#a9a9a9",
    textAlign: "right",
    marginTop: 10,
  },

  // No Posts Text
  noPostsText: {
    fontSize: 16,
    color: "#b0b0b0",
    textAlign: "center",
    marginTop: 20,
  },
});

export default profileStyles;
