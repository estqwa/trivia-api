import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#121212',
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: '#121212',
      }
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen 
        name="quiz/[id]" 
        options={{ 
          headerShown: false,
          animation: 'fade',
        }} 
      />
      <Stack.Screen 
        name="quiz/waiting-room" 
        options={{ 
          title: "Waiting Room",
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="quiz/results/[id]" 
        options={{ 
          title: "Quiz Results",
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
}