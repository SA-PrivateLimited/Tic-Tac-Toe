import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Achievement } from '../types/achievements';

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  visible,
  onClose,
  achievements,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.modalBackground,
      borderRadius: 20,
      padding: 24,
      width: Dimensions.get('window').width * 0.9,
      maxHeight: Dimensions.get('window').height * 0.8,
      borderWidth: 2,
      borderColor: theme.colors.modalBorder,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 20,
    },
    scrollContainer: {
      maxHeight: Dimensions.get('window').height * 0.6,
    },
    achievementGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    achievementCard: {
      width: '48%',
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.cellBorder,
    },
    achievementCardLocked: {
      opacity: 0.5,
    },
    achievementIcon: {
      fontSize: 40,
      textAlign: 'center',
      marginBottom: 8,
    },
    achievementTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
    },
    achievementDescription: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    progressContainer: {
      marginTop: 8,
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: theme.colors.boardBackground,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.buttonPrimary,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    unlockedBadge: {
      backgroundColor: theme.colors.buttonPrimary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: 'center',
      marginTop: 6,
    },
    unlockedText: {
      fontSize: 10,
      color: theme.colors.textPrimary,
      fontWeight: 'bold',
    },
    closeButton: {
      backgroundColor: theme.colors.buttonSecondary,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
      alignItems: 'center',
    },
    closeButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  const renderProgressBar = (achievement: Achievement) => {
    if (!achievement.target || achievement.unlocked) {
      return null;
    }

    const progress = achievement.progress || 0;
    const percentage = Math.min((progress / achievement.target) * 100, 100);

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {progress} / {achievement.target}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Achievements</Text>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.achievementGrid}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked && styles.achievementCardLocked,
                  ]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>

                  {achievement.unlocked ? (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>Unlocked</Text>
                    </View>
                  ) : (
                    renderProgressBar(achievement)
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
