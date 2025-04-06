import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window"); // Get the screen width

// Added contentContainerStyle for ScrollView and adjusted layout to allow scrolling
const profileStyles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },

  scrollViewContent: {
    flexGrow: 1, // This ensures the ScrollView content can grow and fill up remaining space
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  profileHeader: {
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#29ffa4",
    textAlign: "left",
    // fontFamily: "Courier New",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  profileImage: {
    marginBottom: 20,
  },

  editProfile: {
    position: "absolute",
    right: 0,
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
  },
  detailsLabel: {
    fontSize: 18,
    color: "#ddd",
    // fontFamily: "Courier New",
    marginLeft: 10, // Added space between the icon and the label
  },
  detailsValue: {
    fontSize: 20,
    color: "#fff",
    marginLeft: 1,
    fontFamily: "Inter",
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
    // fontFamily: "Courier New",

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
    // fontFamily: "Courier New",
  },
  errorText: {
    fontSize: 20,
    color: "#FF6347",
    marginTop: 15,
    // fontFamily: "Courier New",
  },
  postsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    // fontFamily: "Courier New",

    color: "#fff",
    marginBottom: 20,
    textAlign: "left",
    letterSpacing: 1.5,
  },

  postCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
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
    // fontFamily: "Courier New",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontSize: 20,
    marginBottom: 5,
  },

  postContent: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    // fontFamily: "Courier New",
    textAlign: "left",
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
    // fontFamily: "Courier New",

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
