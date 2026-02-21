import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DetectedPattern } from '../types/session';
import { AppColors } from '../theme';
import { getPatternDefinition } from '../ai/patternLibrary';

interface SuggestionCardProps {
  pattern: DetectedPattern;
  onDismiss?: () => void;
}

/**
 * SuggestionCard - Animated suggestion display
 */
export const SuggestionCard: React.FC<SuggestionCardProps> = ({ pattern }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide up and fade in animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const patternDef = getPatternDefinition(pattern.pattern);

  const getSeverityColor = () => {
    switch (pattern.severity) {
      case 'high':
        return AppColors.error;
      case 'medium':
        return AppColors.warning;
      case 'low':
        return AppColors.success;
      default:
        return AppColors.info;
    }
  };

  const getSeverityGradient = () => {
    switch (pattern.severity) {
      case 'high':
        return [AppColors.error, '#C53030'];
      case 'medium':
        return [AppColors.warning, '#D97706'];
      case 'low':
        return [AppColors.success, '#059669'];
      default:
        return [AppColors.info, '#2563EB'];
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <LinearGradient
        colors={getSeverityGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.patternName}>{patternDef.displayName}</Text>
            <View style={[styles.badge, { backgroundColor: getSeverityColor() + '40' }]}>
              <Text style={[styles.badgeText, { color: getSeverityColor() }]}>
                {Math.round(pattern.confidenceScore)}%
              </Text>
            </View>
          </View>
          <Text style={styles.description}>{patternDef.description}</Text>
        </View>

        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionLabel}>💡 Suggestion</Text>
          <Text style={styles.suggestionText}>{pattern.suggestion}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  patternName: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  suggestionBox: {
    backgroundColor: AppColors.surfaceCard + 'CC',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.textPrimary + '60',
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    lineHeight: 20,
  },
});
