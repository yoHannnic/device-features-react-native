import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, TextInput, StyleSheet, Switch, Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import AddEntryScreen from './screens/AddEntryScreen';
import EntryDetailScreen from './screens/EntryDetailsScreen'; // Fixed screen name
import { Appearance } from 'react-native'; // For dark mode toggle

export type RootStackParamList = {
  Home: undefined;
  AddEntry: undefined;
  EntryDetail: { entryId: string }; // Passing entryId to detail screen
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect system theme (light or dark)
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setIsDarkMode(colorScheme === 'dark');
  }, []);

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1c1c1c' : '#fff', // Change background color based on theme
    },
    header: {
      padding: 16,
      backgroundColor: isDarkMode ? '#333' : '#007AFF', // Dark mode header background
      color: isDarkMode ? '#fff' : '#000',
      fontSize: 18,
      fontWeight: 'bold',
    },
    switch: {
      position: 'absolute',
      top: 16,
      right: 16,
    },
  });

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddEntry" component={AddEntryScreen} />
        <Stack.Screen name="EntryDetail" component={EntryDetailScreen} />
      </Stack.Navigator>

      {/* Example use of the styles */}
      <View style={dynamicStyles.container}>
        <Text style={dynamicStyles.header}>Dark Mode Example</Text>
        <Switch
          style={dynamicStyles.switch}
          value={isDarkMode}
          onValueChange={setIsDarkMode}
        />
      </View>
    </NavigationContainer>
  );
}
