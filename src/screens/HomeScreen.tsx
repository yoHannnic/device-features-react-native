import React, { useEffect, useState } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { TravelEntry } from '../types/types';
import { getEntries, deleteEntry } from '../utils/storage';
import TravelEntryItem from '../components/TravelEntryItem';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MD3Theme } from 'react-native-paper';

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { isDark, theme, toggleTheme } = useTheme() as { 
    isDark: boolean; 
    theme: MD3Theme; 
    toggleTheme: () => void 
  };
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async () => {
    try {
      const savedEntries = await getEntries();
      // Sort entries by date (newest first)
      const sortedEntries = savedEntries.sort((a, b) => b.createdAt - a.createdAt);
      setEntries(sortedEntries);
    } catch (error) {
      Alert.alert('Error', 'Failed to load entries');
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this memory?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Delete cancelled')
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(id);
              await loadEntries(); // Refresh the list after deletion
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
              console.error('Error deleting entry:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onRefresh = () => {
    setRefreshing(false);
    loadEntries();
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="airplane" 
        size={60} 
        color={theme.colors.onSurfaceVariant} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
        No Travel Memories Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
        Start by adding your first travel memory!
      </Text>
      <TouchableOpacity
        style={[styles.addFirstButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddEntry')}
      >
        <Text style={styles.buttonText}>Add First Memory</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name="airplane" 
            size={24} 
            color={theme.colors.primary} 
            style={styles.headerIcon}
          />
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            Travel Diary
          </Text>
        </View>
        <TouchableOpacity 
          onPress={toggleTheme}
          style={styles.themeButton}
        >
          <MaterialIcons
            name={isDark ? 'wb-sunny' : 'nights-stay'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {entries.length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            Memories
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {new Set(entries.map(e => e.address.split(',')[1]?.trim())).size}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            Locations
          </Text>
        </View>
      </View>

      {/* Entries List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TravelEntryItem 
            entry={item} 
            onDelete={handleDelete} 
            theme={theme}
            onPress={() => navigation.navigate('EntryDetail', { entry: item })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddEntry')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  themeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  addFirstButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;