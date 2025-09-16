import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import MainScreen from './src/components/MainScreen';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <MainScreen />
    </AuthProvider>
  );
}
