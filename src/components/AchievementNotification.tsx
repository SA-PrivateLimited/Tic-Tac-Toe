import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { UnlockedAchievementNotification } from '../types/achievements';

interface AchievementNotificationProps {
  notification: UnlockedAchievementNotification | null;
  onDismiss: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    // Slide out and fade out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!notification) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 1000,
    },
    notificationCard: {
      backgroundColor: theme.colors.modalBackground,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      width: Dimensions.get('window').width - 40,
      borderWidth: 2,
      borderColor: theme.colors.buttonPrimary,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    icon: {
      fontSize: 32,
      marginRight: 12,
    },
    headerTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: 12,
      color: theme.colors.buttonPrimary,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    achievementTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    },
    description: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    closeButton: {
      padding: 4,
    },
    closeButtonText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      fontWeight: 'bold',
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}>
      <View style={styles.notificationCard}>
        <View style={styles.header}>
          <Text style={styles.icon}>{notification.achievement.icon}</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>ACHIEVEMENT UNLOCKED!</Text>
            <Text style={styles.achievementTitle}>
              {notification.achievement.title}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>
          {notification.achievement.description}
        </Text>
      </View>
    </Animated.View>
  );
};
