import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>LifeX MVP</Text>
      <Text style={styles.subtitle}>English Version - Dark Theme</Text>
      <Text style={styles.description}>
        This is the new English version with dark theme matching the web design.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#A855F7',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#22C55E',
    textAlign: 'center',
    lineHeight: 24,
  },
});
