import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Share,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { MD3Theme } from 'react-native-paper';
import { TravelEntry } from '../types/types';
import MapView, { Marker } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

type EntryDetailScreenProps = {
  route: {
    params: {
      entry: TravelEntry;
    };
  };
  navigation: any;
};

const EntryDetailScreen = ({ route, navigation }: EntryDetailScreenProps) => {
  const { theme } = useTheme() as { theme: MD3Theme };
  const { entry } = route.params;

  const handleOpenInMaps = () => {
    const url = Platform.select({
      ios: `maps://app?ll=${entry.latitude},${entry.longitude}&q=${entry.address}`,
      android: `geo:${entry.latitude},${entry.longitude}?q=${entry.address}`
    });
    
    Linking.canOpenURL(url!).then(supported => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Alert.alert('Error', 'Could not open maps app');
      }
    });
  };

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await Share.share({
        message: `Check out my travel memory: ${entry.title}\n\n${entry.address}\n\n${entry.notes || ''}`,
        title: entry.title,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type
        } else {
          // Shared
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share memory');
    }
  };

  const formattedDate = format(new Date(entry.createdAt), 'MMMM do, yyyy');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleShare}
          style={styles.shareButton}
        >
          <FontAwesome 
            name="share-alt" 
            size={20} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Photo */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: entry.imageUri }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>

      {/* Title and Date */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          {entry.title}
        </Text>
        <View style={styles.dateContainer}>
          <MaterialIcons 
            name="date-range" 
            size={16} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
            {formattedDate}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons 
            name="location-sharp" 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Location
          </Text>
        </View>
        <Text style={[styles.addressText, { color: theme.colors.onSurface }]}>
          {entry.address}
        </Text>
        <TouchableOpacity
          style={[
            styles.mapButton,
            { backgroundColor: theme.colors.primaryContainer }
          ]}
          onPress={handleOpenInMaps}
        >
          <Text style={[styles.mapButtonText, { color: theme.colors.onPrimaryContainer }]}>
            Open in Maps
          </Text>
        </TouchableOpacity>
        
        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: entry.latitude,
              longitude: entry.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: entry.latitude,
                longitude: entry.longitude
              }}
              title={entry.title}
              description={entry.address}
            />
          </MapView>
        </View>
      </View>

      {/* Notes */}
      {entry.notes && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons 
              name="notes" 
              size={20} 
              color={theme.colors.primary} 
            />
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Notes
            </Text>
          </View>
          <Text style={[styles.notesText, { color: theme.colors.onSurface }]}>
            {entry.notes}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    height: 300,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 16,
  },
  mapButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  mapButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default EntryDetailScreen;