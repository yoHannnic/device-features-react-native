import { TravelEntry } from '../types/types';

export const validateEntry = (entry: Omit<TravelEntry, 'id' | 'createdAt'>) => {
  if (!entry.imageUri) {
    return 'Photo is required';
  }
  if (!entry.address) {
    return 'Address is required';
  }
  if (!entry.latitude || !entry.longitude) {
    return 'Location data is invalid';
  }
  return null;
};