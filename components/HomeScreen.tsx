import React, { useState } from "react";
import {
  ScrollView,
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // Import useRouter
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { styles } from "@/styles/HomeScreen.styles";

const HomeScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter(); // Initialize useRouter hook

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <LinearGradient
        colors={["#0f0c29", "#302b63", "#24243e"]}
        style={styles.gradient}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.welcomeText}>sesh.</Text>

        {isLogin ? (
          <View style={styles.formContainer}>
            <LoginForm />
            {/* Pass the login success handler */}
            <TouchableOpacity
              onPress={() => setIsLogin(false)}
              activeOpacity={0.8}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                New here?
                <Text style={styles.switchTextBold}>Sign up & Drop In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <RegisterForm />
            <TouchableOpacity
              onPress={() => setIsLogin(true)}
              activeOpacity={0.8}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                Already have an account?
                <Text style={styles.switchTextBold}>Log In & Shred</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
