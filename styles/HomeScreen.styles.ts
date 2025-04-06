import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 80 : 20,
  },
  descriptionText: {
    color: "#ffffff",
    fontSize: 18, // Slightly larger for emphasis
    fontWeight: "600", // Modern semi-bold
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 30,
    opacity: 0.9, // Slightly transparent for sleekness
    lineHeight: 26, // Perfect balance for readability
    letterSpacing: 0.8, // Subtle spacing for a refined look
    textShadowColor: "rgba(255, 255, 255, 0.2)", // Soft glow effect
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  welcomeText: {
    fontSize: 48, // Larger text to make a statement
    fontWeight: "900", // Boldest weight for maximum emphasis
    color: "#29ffa4",
    textAlign: "center", // Center the text
    fontFamily: "Urbanist_700Bold", // Use a bold, modern font
    letterSpacing: 2, // Slight letter spacing for a clean look
    textShadowColor: "rgba(255, 255, 255, 0.2)", // Subtle glow effect
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10, // Soft shadow to make it pop
    marginBottom: 40, // Space below for separation
  },

  formContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  switchButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  switchText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontFamily: "Urbanist_500Medium",
  },
  switchTextBold: {
    fontWeight: "bold",
    color: "#ffcc00",
    textShadowColor: "rgba(255, 204, 0, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});
