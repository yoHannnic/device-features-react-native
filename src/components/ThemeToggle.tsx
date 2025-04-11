import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <MaterialIcons
        name={isDark ? 'wb-sunny' : 'nights-stay'}
        size={24}
        color="white"
      />
    </TouchableOpacity>
  );
};

export default ThemeToggle;