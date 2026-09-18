import React from 'react';
import { useRouter } from 'expo-router';
import AuthScreen from '../components/AuthScreen';

export default function AuthRoute() {
  const router = useRouter();

  return (
    <AuthScreen
      onAuthSuccess={() => router.replace('/(tabs)/profile')}
      onNavigateBack={() => router.back()}
    />
  );
}
