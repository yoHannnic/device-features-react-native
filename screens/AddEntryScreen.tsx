import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera'; // Correctly imported Camera component
import { CameraType } from 'expo-camera'; // Correctly imported CameraType type
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

const AddEntryScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<Camera | null>(null); // Camera ref
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: notiStatus } = await Notifications.requestPermissionsAsync();

      if (camStatus !== 'granted' || locStatus !== 'granted' || notiStatus !== 'granted') {
        Alert.alert('Permissions required', 'Please grant all permissions to use this feature.');
        setHasPermission(false);
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setLoading(true);

    try {
      // 1. Take photo
      const photo = await cameraRef.current.takePictureAsync();

      // 2. Get location
      const { coords } = await Location.getCurrentPositionAsync({});
      const [addressObj] = await Location.reverseGeocodeAsync(coords);
      const address = `${addressObj.name}, ${addressObj.city}`;

      // 3. Save to AsyncStorage
      const newEntry = {
        id: uuidv4(),
        photoUri: photo.uri,
        location: address,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      const data = await AsyncStorage.getItem('entries');
      const entries = data ? JSON.parse(data) : [];
      entries.push(newEntry);
      await AsyncStorage.setItem('entries', JSON.stringify(entries));

      // 4. Show Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📸 Travel Entry Saved!',
          body: `Saved entry from ${address}`,
        },
        trigger: null, // immediate
      });

      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permissions not granted.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed JSX element type 'Camera' */}
      <Camera ref={cameraRef} style={styles.camera} type={CameraType.back} /> {/* Correct usage of CameraType */}
      <TouchableOpacity style={styles.button} onPress={handleCapture} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Capture & Save'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddEntryScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  text: { fontSize: 18, padding: 20 },
});
