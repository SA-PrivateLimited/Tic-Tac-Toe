import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MarkerThemeId, MARKER_THEMES } from '../types/markers';
import { useTheme } from '../theme/ThemeContext';
import { useGameStore } from '../store/gameStore';

interface MarkerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MarkerModal: React.FC<MarkerModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { markerTheme, setMarkerTheme } = useGameStore();

  const handleSelectTheme = async (newThemeId: MarkerThemeId) => {
    await setMarkerTheme(newThemeId);
  };

  const markerOptions = Object.values(MARKER_THEMES);

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
    markersList: {
      maxHeight: 400,
      marginBottom: 20,
    },
    markerItem: {
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
    selectedMarker: {
      backgroundColor: theme.colors.boardBackground,
      borderColor: theme.colors.playerO,
      borderWidth: 3,
    },
    markerPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    markerSymbol: {
      fontSize: 32,
      width: 50,
      textAlign: 'center',
    },
    vsText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    markerLabel: {
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
      marginBottom: 40,
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
          <Text style={styles.title}>Choose Markers</Text>
          <Text style={styles.subtitle}>
            Select your preferred marker theme
          </Text>

          <ScrollView style={styles.markersList} showsVerticalScrollIndicator={false}>
            {markerOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.markerItem,
                  markerTheme === option.id && styles.selectedMarker,
                ]}
                onPress={() => handleSelectTheme(option.id)}
              >
                <View style={styles.markerPreview}>
                  <Text style={styles.markerSymbol}>{option.playerX.emoji}</Text>
                  <Text style={[styles.vsText, { marginHorizontal: 8 }]}>vs</Text>
                  <Text style={styles.markerSymbol}>{option.playerO.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.markerLabel,
                    markerTheme === option.id && styles.selectedLabel,
                  ]}
                >
                  {option.name}
                </Text>
                {markerTheme === option.id && (
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

