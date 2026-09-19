import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { RentalProvider } from '@/context/RentalContext';
import { Colors } from '@/constants/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <RentalProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors.card,
            },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontWeight: '800',
            },
            contentStyle: {
              backgroundColor: Colors.background,
            },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="vehicle/[id]"
            options={{
              title: 'Vehicle Details',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="booking/checkout"
            options={{
              title: 'Booking Summary & KYC',
              headerBackTitle: 'Details',
            }}
          />
          <Stack.Screen
            name="booking/success"
            options={{
              title: 'Booking Confirmed 🎉',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              title: '24/7 Roadside Assistance & SOS',
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              title: 'Rider Authentication',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="admin"
            options={{
              title: 'Admin Fleet Control',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
      </ThemeProvider>
    </RentalProvider>
  );
}
