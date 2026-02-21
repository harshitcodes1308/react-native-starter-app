import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { AppColors } from '../theme';

interface CognitiveMeterProps {
  focusScore: number; // 0-100
  size?: number;
  showLabel?: boolean;
}

/**
 * CognitiveMeter - Circular progress indicator for focus score
 */
export const CognitiveMeter: React.FC<CognitiveMeterProps> = ({
  focusScore,
  size = 100,
  showLabel = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: focusScore,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [focusScore, animatedValue]);

  const getColor = () => {
    if (focusScore >= 80) return AppColors.success;
    if (focusScore >= 60) return AppColors.warning;
    return AppColors.error;
  };

  const getLabel = () => {
    if (focusScore >= 80) return 'High Focus';
    if (focusScore >= 60) return 'Moderate';
    return 'Low Focus';
  };

  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.circleContainer}>
        {/* Background circle */}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 8,
              borderColor: AppColors.surfaceCard,
            },
          ]}
        />

        {/* Animated progress circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 8,
              borderColor: getColor(),
              borderTopColor: 'transparent',
              transform: [
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.scoreText, { fontSize: size * 0.28 }]}>
            {Math.round(focusScore)}
          </Text>
          <Text style={[styles.percentText, { fontSize: size * 0.12 }]}>%</Text>
        </View>
      </View>

      {showLabel && <Text style={[styles.label, { color: getColor() }]}>{getLabel()}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreText: {
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  percentText: {
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginLeft: 2,
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});
