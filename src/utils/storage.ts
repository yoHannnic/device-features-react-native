import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types/types';

const ENTRIES_KEY = 'travel_entries';

export const saveEntry = async (entry: Omit<TravelEntry, 'id'>) => {
  try {
    const entries = await getEntries();
    const newEntry = { ...entry, id: Date.now().toString() };
    await AsyncStorage.setItem(
      ENTRIES_KEY,
      JSON.stringify([...entries, newEntry])
    );
    return newEntry;
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const entries = await AsyncStorage.getItem(ENTRIES_KEY);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

export const deleteEntry = async (id: string) => {
  try {
    const entries = await getEntries();
    const filteredEntries = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filteredEntries));
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

export const clearEntries = async () => {
  try {
    await AsyncStorage.removeItem(ENTRIES_KEY);
  } catch (error) {
    console.error('Error clearing entries:', error);
    throw error;
  }
};