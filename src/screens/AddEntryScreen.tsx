import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCamera } from '../hooks/useCamera';
import { useLocation } from '../hooks/useLocation';
import { useNotifications } from '../hooks/useNotifications';
import { saveEntry } from '../utils/storage';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { MD3Theme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

const AddEntryScreen = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme() as { theme: MD3Theme };
  const { imageUri, takePhoto, clearImage } = useCamera();
  const { address, location, isLoading, getCurrentLocation, clearLocation } = useLocation();
  const { sendNotification } = useNotifications();
  
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      clearImage();
      clearLocation();
    });
    return unsubscribe;
  }, [navigation]);

  const handleTakePhoto = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const uri = await takePhoto();
      if (uri) {
        const locationData = await getCurrentLocation();
        if (!locationData) {
          clearImage();
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSave = async () => {
    if (!imageUri || !address || !location) {
      Alert.alert('Error', 'Please take a photo first to get your location');
      return;
    }

    setIsSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const newEntry = {
        imageUri,
        address,
        title: title.trim() || `Trip to ${address.split(',')[0]}`,
        notes,
        date: date.getTime(),
        latitude: location.latitude,
        longitude: location.longitude,
        createdAt: Date.now(),
      };

      await saveEntry(newEntry);
      await sendNotification(
        'New Travel Entry', 
        `Saved your trip to ${newEntry.title}`
      );
      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Photo Memory
          </Text>
          <TouchableOpacity
            style={[
              styles.photoButton, 
              { 
                backgroundColor: imageUri ? 'transparent' : theme.colors.primaryContainer,
                borderColor: theme.colors.outline
              }
            ]}
            onPress={handleTakePhoto}
            disabled={isLoading || isSaving}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.photoButtonContent}>
                <FontAwesome name="camera" size={24} color={theme.colors.onPrimaryContainer} />
                <Text style={[styles.buttonText, { color: theme.colors.onPrimaryContainer }]}>
                  Take Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Location Section */}
        {imageUri && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              Location
            </Text>
            <View style={[
              styles.locationContainer, 
              { backgroundColor: theme.colors.surfaceVariant }
            ]}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
                    Getting your location...
                  </Text>
                </View>
              ) : (
                address && (
                  <>
                    <View style={styles.locationHeader}>
                      <Ionicons 
                        name="location-sharp" 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                      <Text style={[styles.addressText, { color: theme.colors.onSurface }]}>
                        {address}
                      </Text>
                    </View>
                  </>
                )
              )}
            </View>
          </View>
        )}

        {/* Trip Details Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Trip Details
          </Text>
          
          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>
              Title (optional)
            </Text>
            <View style={[
              styles.inputField, 
              { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline
              }
            ]}>
              <TextInput
                style={[styles.inputText, { color: theme.colors.onSurface }]}
                placeholder="Give your trip a name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>
              Date
            </Text>
            <TouchableOpacity
              style={[
                styles.inputField, 
                { 
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outline
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.inputText, { color: theme.colors.onSurface }]}>
                {date.toLocaleDateString()}
              </Text>
              <MaterialIcons 
                name="calendar-today" 
                size={20} 
                color={theme.colors.onSurfaceVariant} 
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Notes Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.colors.onSurfaceVariant }]}>
              Notes (optional)
            </Text>
            <View style={[
              styles.notesField, 
              { 
                backgroundColor: theme.colors.surfaceVariant,
                borderColor: theme.colors.outline
              }
            ]}>
              <TextInput
                style={[styles.notesText, { color: theme.colors.onSurface }]}
                placeholder="Add some notes about your trip..."
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: theme.colors.primary,
              opacity: (!imageUri || !address || isSaving) ? 0.6 : 1
            }
          ]}
          onPress={handleSave}
          disabled={!imageUri || !address || isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              Save Memory
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoButton: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  photoButtonContent: {
    alignItems: 'center',
    gap: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  locationContainer: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  addressText: {
    fontSize: 16,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputField: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  notesField: {
    minHeight: 100,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    height: 52,
  },
});

export default AddEntryScreen;