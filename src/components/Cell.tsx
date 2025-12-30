import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { Player } from '../types/game';
import { useTheme } from '../theme/ThemeContext';
import { useGameStore } from '../store/gameStore';
import { MARKER_THEMES } from '../types/markers';

interface CellProps {
  value: Player;
  onPress: () => void;
  disabled: boolean;
  isWinning: boolean;
  size?: number;
}

export const Cell: React.FC<CellProps> = ({ value, onPress, disabled, isWinning, size = 100 }) => {
  const { theme, themeId } = useTheme();
  const { markerTheme } = useGameStore();
  const markerThemeData = MARKER_THEMES[markerTheme];
  
  // Calculate font size based on cell size
  const fontSize = Math.floor(size * 0.56);
  
  // Get marker symbol based on theme
  const getMarkerSymbol = (player: Player): string => {
    if (!player) return '';
    return player === 'X' ? markerThemeData.playerX.symbol : markerThemeData.playerO.symbol;
  };
  
  // Sparkle animation for glow theme
  const sparkleOpacity = useRef(new Animated.Value(0.3)).current;
  const sparkleScale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.2)).current;
  const shadowRadius = useRef(new Animated.Value(6)).current;
  
  // Fire sparkle animations for X and O in glow theme
  const fireSparkle1 = useRef(new Animated.Value(0)).current;
  const fireSparkle2 = useRef(new Animated.Value(0)).current;
  const fireSparkle3 = useRef(new Animated.Value(0)).current;
  const fireSparkle4 = useRef(new Animated.Value(0)).current;
  const fireSparkle5 = useRef(new Animated.Value(0)).current;
  const fireSparkle6 = useRef(new Animated.Value(0)).current;
  const fireSparkle7 = useRef(new Animated.Value(0)).current;
  const fireSparkle8 = useRef(new Animated.Value(0)).current;
  const textGlow = useRef(new Animated.Value(1)).current;
  const textScale = useRef(new Animated.Value(1)).current;
  
  const isGlowTheme = themeId === 'glow';
  const hasValue = value !== null;
  
  useEffect(() => {
    if (isGlowTheme && !value && !disabled) {
      // Create a continuous sparkle animation with pulsing glow effect
      // Use separate animations for native driver compatibility
      const nativeAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(sparkleOpacity, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleScale, {
              toValue: 1.03,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(shadowOpacity, {
              toValue: 0.8,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(shadowRadius, {
              toValue: 15,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(sparkleOpacity, {
              toValue: 0.3,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleScale, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(shadowOpacity, {
              toValue: 0.2,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(shadowRadius, {
              toValue: 6,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      
      nativeAnimation.start();
      
      return () => {
        nativeAnimation.stop();
      };
    } else {
      // Reset animation when not in glow theme or cell is filled
      sparkleOpacity.setValue(0.3);
      sparkleScale.setValue(1);
      shadowOpacity.setValue(0.2);
      shadowRadius.setValue(6);
    }
  }, [isGlowTheme, value, disabled]);

  // Fire sparkle animation for X and O in glow theme
  useEffect(() => {
    if (isGlowTheme && hasValue && !disabled) {
      // Create fire-like flickering sparkle animation with varied timings
      const fireAnimation = Animated.loop(
        Animated.parallel([
          // Multiple sparkles with different timings for fire effect
          Animated.sequence([
            Animated.timing(fireSparkle1, {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle1, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(100),
            Animated.timing(fireSparkle2, {
              toValue: 1,
              duration: 380,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle2, {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(50),
            Animated.timing(fireSparkle3, {
              toValue: 1,
              duration: 320,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle3, {
              toValue: 0,
              duration: 280,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(150),
            Animated.timing(fireSparkle4, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle4, {
              toValue: 0,
              duration: 240,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(80),
            Animated.timing(fireSparkle5, {
              toValue: 1,
              duration: 360,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle5, {
              toValue: 0,
              duration: 260,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(120),
            Animated.timing(fireSparkle6, {
              toValue: 1,
              duration: 390,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle6, {
              toValue: 0,
              duration: 270,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(fireSparkle7, {
              toValue: 1,
              duration: 340,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle7, {
              toValue: 0,
              duration: 230,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(170),
            Animated.timing(fireSparkle8, {
              toValue: 1,
              duration: 370,
              useNativeDriver: true,
            }),
            Animated.timing(fireSparkle8, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ]),
          // Text glow pulsing - fire-like flicker
          Animated.loop(
            Animated.sequence([
              Animated.timing(textGlow, {
                toValue: 1.8,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(textGlow, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
              }),
              Animated.timing(textGlow, {
                toValue: 1.6,
                duration: 220,
                useNativeDriver: true,
              }),
              Animated.timing(textGlow, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }),
            ])
          ),
          // Text scale flicker - fire-like movement
          Animated.loop(
            Animated.sequence([
              Animated.timing(textScale, {
                toValue: 1.04,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(textScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(textScale, {
                toValue: 1.02,
                duration: 110,
                useNativeDriver: true,
              }),
              Animated.timing(textScale, {
                toValue: 1,
                duration: 90,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      );
      
      fireAnimation.start();
      
      return () => {
        fireAnimation.stop();
      };
    } else {
      // Reset fire animations
      fireSparkle1.setValue(0);
      fireSparkle2.setValue(0);
      fireSparkle3.setValue(0);
      fireSparkle4.setValue(0);
      fireSparkle5.setValue(0);
      fireSparkle6.setValue(0);
      fireSparkle7.setValue(0);
      fireSparkle8.setValue(0);
      textGlow.setValue(1);
      textScale.setValue(1);
    }
  }, [isGlowTheme, hasValue, disabled, value]);

  const styles = StyleSheet.create({
    cell: {
      width: size,
      height: size,
      marginRight: 8,
      backgroundColor: theme.colors.cellBackground,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2.5,
      borderColor: theme.colors.cellBorder,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
      overflow: 'hidden',
    },
    sparkleOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: theme.colors.shadowColor,
    },
    sparkleDot: {
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.shadowColor,
    },
    fireSparkle: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      shadowColor: '#ffaa00',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 5,
    },
    textContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    winningCell: {
      backgroundColor: theme.colors.winningCell,
      borderColor: theme.colors.playerO,
      borderWidth: 3,
      shadowColor: theme.colors.playerO,
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 10,
      transform: [{ scale: 1.05 }],
    },
    cellText: {
      fontSize: fontSize,
      fontWeight: '800',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    xText: {
      color: theme.colors.playerX,
      textShadowColor: theme.colors.playerX,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
    oText: {
      color: theme.colors.playerO,
      textShadowColor: theme.colors.playerO,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
  });

  const animatedSparkleStyle = {
    opacity: sparkleOpacity,
    transform: [{ scale: sparkleScale }],
    shadowOpacity: shadowOpacity,
    shadowRadius: shadowRadius,
  };

  // Sparkle dot positions (corners and edges) - calculated based on cell size
  const dotSize = 4;
  const dotOffset = 6;
  const centerPos = size / 2 - dotSize / 2;
  const sparkleDots = [
    { top: dotOffset, left: dotOffset },
    { top: dotOffset, right: dotOffset },
    { bottom: dotOffset, left: dotOffset },
    { bottom: dotOffset, right: dotOffset },
    { top: centerPos, left: dotOffset },
    { top: centerPos, right: dotOffset },
    { top: dotOffset, left: centerPos },
    { bottom: dotOffset, left: centerPos },
  ];

  // Fire sparkle positions around X/O text - positioned around the text with fire colors
  const textCenter = size / 2;
  const textRadius = fontSize * 0.4;
  // Fire colors: bright orange, yellow, red for both X and O to make them clearly visible
  const fireColors = ['#ff6b00', '#ffaa00', '#ff4400', '#ff8800', '#ffcc00', '#ff6600', '#ff9900', '#ff5500'];
  
  const fireSparkles = [
    { 
      top: textCenter - textRadius - 12, 
      left: textCenter - textRadius * 0.4,
      color: fireColors[0],
    },
    { 
      top: textCenter - textRadius - 10, 
      left: textCenter + textRadius * 0.3,
      color: fireColors[1],
    },
    { 
      top: textCenter + textRadius * 0.6, 
      left: textCenter - textRadius * 0.9,
      color: fireColors[2],
    },
    { 
      top: textCenter + textRadius * 0.7, 
      left: textCenter + textRadius * 0.4,
      color: fireColors[3],
    },
    { 
      top: textCenter - textRadius * 0.3, 
      left: textCenter - textRadius - 12,
      color: fireColors[4],
    },
    { 
      top: textCenter - textRadius * 0.4, 
      left: textCenter + textRadius + 10,
      color: fireColors[5],
    },
    { 
      top: textCenter - textRadius * 0.8, 
      left: textCenter - textRadius * 0.1,
      color: fireColors[6],
    },
    { 
      top: textCenter + textRadius * 0.2, 
      left: textCenter + textRadius * 0.7,
      color: fireColors[7],
    },
  ];

  const fireSparkleValues = [fireSparkle1, fireSparkle2, fireSparkle3, fireSparkle4, fireSparkle5, fireSparkle6, fireSparkle7, fireSparkle8];

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        isWinning && styles.winningCell,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {isGlowTheme && !value && !disabled && (
        <>
          <Animated.View 
            style={[
              styles.sparkleOverlay, 
              animatedSparkleStyle,
              {
                shadowColor: theme.colors.shadowColor,
                shadowOffset: { width: 0, height: 0 },
              }
            ]} 
          />
          {sparkleDots.map((dot, index) => (
            <Animated.View
              key={index}
              style={[
                styles.sparkleDot,
                dot,
                {
                  opacity: sparkleOpacity,
                  transform: [{ scale: sparkleScale }],
                },
              ]}
            />
          ))}
        </>
      )}
      {isGlowTheme && hasValue && (
        <View style={styles.textContainer}>
          {fireSparkles.map((sparkle, index) => (
            <Animated.View
              key={`fire-${index}`}
              style={[
                styles.fireSparkle,
                sparkle,
                {
                  backgroundColor: sparkle.color,
                  opacity: fireSparkleValues[index],
                  transform: [
                    { 
                      scale: fireSparkleValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 2.0],
                      })
                    },
                    {
                      translateY: fireSparkleValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -12],
                      })
                    }
                  ],
                },
              ]}
            />
          ))}
        </View>
      )}
      <Animated.Text 
        style={[
        styles.cellText,
        value === 'X' && styles.xText,
        value === 'O' && styles.oText,
          isGlowTheme && hasValue && {
            textShadowRadius: textGlow.interpolate({
              inputRange: [1, 1.5],
              outputRange: [8, 20],
            }),
            transform: [{ scale: textScale }],
          },
        ]}
      >
        {getMarkerSymbol(value)}
      </Animated.Text>
    </TouchableOpacity>
  );
};
