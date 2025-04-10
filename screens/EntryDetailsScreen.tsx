import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';

// Define the Entry type
type Entry = {
  id: string;
  photoUri: string;
  location: string;
  latitude: number;
  longitude: number;
};

// Define RouteParams to type the route parameters
type RouteParams = {
  entryId: string;
};

// Screen component
const EntryDetailsScreen = () => {
  const route = useRoute<RouteProp<Record<string, { entryId: string }>, 'EntryDetails'>>();
  const navigation = useNavigation();
  const { entryId } = route.params;
  const [entry, setEntry] = React.useState<Entry | null>(null);

  React.useEffect(() => {
    const loadEntry = async () => {
      const data = await AsyncStorage.getItem('entries');
      if (data) {
        const entries: Entry[] = JSON.parse(data);
        const foundEntry = entries.find((e) => e.id === entryId);
        if (foundEntry) {
          setEntry(foundEntry);
        }
      }
    };

    loadEntry();
  }, [entryId]);

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: entry.photoUri }} style={styles.image} />
      <Text style={styles.locationText}>{entry.location}</Text>
      <Text style={styles.coordinatesText}>
        Latitude: {entry.latitude} | Longitude: {entry.longitude}
      </Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: entry.latitude,
          longitude: entry.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker coordinate={{ latitude: entry.latitude, longitude: entry.longitude }} />
      </MapView>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    color: 'gray',
  },
  map: {
    width: '100%',
    height: 250,
    marginTop: 20,
  },
});

export default EntryDetailsScreen;
