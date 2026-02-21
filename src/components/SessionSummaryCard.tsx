import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Session } from '../types/session';
import { AppColors } from '../theme';
import { getModeConfig } from '../ai/patternLibrary';

interface SessionSummaryCardProps {
  session: Session;
  onPress: () => void;
}

/**
 * SessionSummaryCard - Card for displaying past session summary
 */
export const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({ session, onPress }) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getFocusScoreColor = (score: number): string => {
    if (score >= 80) return AppColors.success;
    if (score >= 60) return AppColors.warning;
    return AppColors.error;
  };

  const modeConfig = getModeConfig(session.mode);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <LinearGradient
        colors={[AppColors.surfaceCard, AppColors.surfaceElevated]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.modeTag}>
            <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
            <Text style={styles.modeText}>{modeConfig.displayName}</Text>
          </View>
          <Text style={styles.date}>{formatDate(session.timestamp)}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(session.duration)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Focus Score</Text>
            <Text
              style={[
                styles.statValue,
                { color: getFocusScoreColor(session.cognitiveMetrics.focusScore) },
              ]}
            >
              {Math.round(session.cognitiveMetrics.focusScore)}%
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Patterns</Text>
            <Text style={styles.statValue}>{session.detectedPatterns.length}</Text>
          </View>
        </View>

        {/* Key Insights */}
        {session.summary.keyInsights.length > 0 && (
          <View style={styles.insightBox}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={styles.insightText} numberOfLines={2}>
              {session.summary.keyInsights[0]}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {session.transcript.length} transcript chunks • {session.summary.objectionCount}{' '}
            objections
          </Text>
          <Text style={styles.viewDetails}>View Details →</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.textMuted + '20',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.accentCyan + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.accentCyan,
  },
  date: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  divider: {
    width: 1,
    backgroundColor: AppColors.textMuted + '30',
    marginHorizontal: 8,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryDark + '80',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.textMuted + '20',
  },
  footerText: {
    fontSize: 11,
    color: AppColors.textMuted,
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.accentCyan,
  },
});
