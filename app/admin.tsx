import React from 'react';
import { useRouter } from 'expo-router';
import AdminPanelScreen from '../components/AdminPanelScreen';

export default function AdminRoute() {
  const router = useRouter();

  return (
    <AdminPanelScreen onNavigateBack={() => router.back()} />
  );
}
