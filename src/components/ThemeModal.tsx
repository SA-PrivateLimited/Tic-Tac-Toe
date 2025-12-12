import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ThemeId } from '../types/theme';
import { useTheme } from '../theme/ThemeContext';
import { THEMES } from '../theme/themes';

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ visible, onClose }) => {
  const { theme, themeId, setTheme } = useTheme();

  const handleSelectTheme = async (newThemeId: ThemeId) => {
    await setTheme(newThemeId);
  };

  const themeOptions: Array<{ id: ThemeId; name: string; emoji: string }> = [
    { id: 'dark', name: 'Dark Mode', emoji: '🌙' },
    { id: 'light', name: 'Light Mode', emoji: '☀️' },
    { id: 'neon', name: 'Neon Mode', emoji: '⚡' },
    { id: 'ocean', name: 'Ocean Mode', emoji: '🌊' },
    { id: 'sunset', name: 'Sunset Mode', emoji: '🌅' },
  ];

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.modalBackground,
      borderRadius: 24,
      padding: 24,
      width: '85%',
      maxWidth: 400,
      maxHeight: '80%',
      borderWidth: 3,
      borderColor: theme.colors.modalBorder,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 15,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    themesList: {
      maxHeight: 400,
      marginBottom: 20,
    },
    themeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.cellBackground,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
    },
    selectedTheme: {
      backgroundColor: theme.colors.boardBackground,
      borderColor: theme.colors.playerO,
      borderWidth: 3,
    },
    emoji: {
      fontSize: 32,
      marginRight: 16,
    },
    themeLabel: {
      flex: 1,
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      letterSpacing: 0.5,
    },
    selectedLabel: {
      color: theme.colors.playerO,
      fontWeight: '800',
    },
    checkmark: {
      fontSize: 24,
      color: theme.colors.playerO,
      fontWeight: 'bold',
    },
    closeButton: {
      backgroundColor: theme.colors.buttonPrimary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.colors.buttonPrimary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Choose Theme</Text>
          <Text style={styles.subtitle}>
            Select your preferred visual theme
          </Text>

          <ScrollView style={styles.themesList} showsVerticalScrollIndicator={false}>
            {themeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.themeItem,
                  themeId === option.id && styles.selectedTheme,
                ]}
                onPress={() => handleSelectTheme(option.id)}
              >
                <Text style={styles.emoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.themeLabel,
                    themeId === option.id && styles.selectedLabel,
                  ]}
                >
                  {option.name}
                </Text>
                {themeId === option.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
