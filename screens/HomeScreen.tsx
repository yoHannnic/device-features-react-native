import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';  // <-- Add this import

// Define types
type Entry = {
  id: string;
  photoUri: string;
  location: string;
  latitude: number;
  longitude: number;
};

type RootStackParamList = {
  Home: undefined;
  EntryDetails: { entryId: string };
  AddEntry: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>; // <-- Navigation typing

const HomeScreen = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation<HomeScreenNavigationProp>(); // <-- Use typed navigation

  useEffect(() => {
    const loadEntries = async () => {
      const data = await AsyncStorage.getItem('entries');
      if (data) {
        setEntries(JSON.parse(data));
      }
    };

    const unsubscribe = navigation.addListener('focus', loadEntries);
    return unsubscribe;
  }, [navigation]);

  const deleteEntry = async (id: string) => {
    const filtered = entries.filter((e) => e.id !== id);
    setEntries(filtered);
    await AsyncStorage.setItem('entries', JSON.stringify(filtered));
  };

  const filteredEntries = entries.filter((entry) =>
    entry.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <TextInput
        style={[styles.searchInput, darkMode && styles.darkInput]}
        placeholder="Search by location..."
        value={search}
        onChangeText={setSearch}
      />
      <Switch
        value={darkMode}
        onValueChange={setDarkMode}
        style={styles.darkModeToggle}
      />
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.entry, darkMode && styles.darkEntry]}>
            <TouchableOpacity onPress={() => navigation.navigate('EntryDetails', { entryId: item.id })}>
              <Image source={{ uri: item.photoUri }} style={styles.image} />
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker coordinate={{ latitude: item.latitude, longitude: item.longitude }} />
              </MapView>
              <View style={styles.details}>
                <Text style={[styles.text, darkMode && styles.darkText]}>{item.location}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteEntry(item.id)}>
              <Text style={[styles.delete, darkMode && styles.darkDelete]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={[styles.addButton, darkMode && styles.darkAddButton]}
        onPress={() => navigation.navigate('AddEntry')}
      >
        <Text style={styles.addText}>+ Add Entry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  darkContainer: { backgroundColor: '#333' },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
  },
  darkInput: { backgroundColor: '#555', color: 'white' },
  darkModeToggle: { position: 'absolute', top: 20, right: 20 },
  entry: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
  },
  darkEntry: { backgroundColor: '#444' },
  image: {
    width: '100%',
    height: 200,
  },
  map: {
    width: '100%',
    height: 150,
  },
  details: {
    padding: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  darkText: { color: 'white' },
  delete: {
    marginTop: 6,
    color: 'red',
  },
  darkDelete: { color: '#ff6666' },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  darkAddButton: { backgroundColor: '#0051a8' },
  addText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
