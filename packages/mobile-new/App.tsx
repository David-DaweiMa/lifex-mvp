import React from 'react';
import { StatusBar } from 'expo-status-bar';
import MainScreen from './src/components/MainScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <MainScreen />
    </>
  );
}
