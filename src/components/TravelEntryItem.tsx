import React from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Easing
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MD3Theme } from 'react-native-paper';
import { TravelEntry } from '../types/types';

type TravelEntryItemProps = {
  entry: TravelEntry;
  onDelete: (id: string) => void;
  onPress?: (entry: TravelEntry) => void;
  theme: MD3Theme;
};

const TravelEntryItem = ({ entry, onDelete, onPress, theme }: TravelEntryItemProps) => {
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    Animated.timing(opacityValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => onDelete(entry.id));
  };

  // Fallback title if not provided
  const displayTitle = entry.title || `Trip to ${entry.address.split(',')[0]}`;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.surface,
          transform: [{ scale: scaleValue }],
          opacity: opacityValue
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content}
        onPress={() => onPress?.(entry)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: entry.imageUri }} 
          style={styles.image} 
          resizeMode="cover"
        />
        
        <View style={styles.details}>
          <Text 
            style={[styles.title, { color: theme.colors.onSurface }]} 
            numberOfLines={1}
          >
            {displayTitle}
          </Text>
          
          <View style={styles.locationContainer}>
            <Ionicons 
              name="location-sharp" 
              size={14} 
              color={theme.colors.primary} 
              style={styles.locationIcon}
            />
            <Text 
              style={[styles.address, { color: theme.colors.onSurface }]} 
              numberOfLines={1}
            >
              {entry.address.split(',')[0]}
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <MaterialIcons 
              name="date-range" 
              size={14} 
              color={theme.colors.onSurfaceVariant} 
              style={styles.dateIcon}
            />
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(entry.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={handleDelete}
        style={styles.deleteButton}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <MaterialIcons 
          name="delete-outline" 
          size={24} 
          color={theme.colors.error} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 6,
  },
  address: {
    fontSize: 14,
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 6,
  },
  date: {
    fontSize: 12,
    opacity: 0.8,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'center',
  },
});

export default TravelEntryItem;