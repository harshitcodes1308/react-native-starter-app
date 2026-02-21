import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppColors } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { Session } from '../types/session';
import { useSessionAnalyzer } from '../hooks/useSessionAnalyzer';
import { getModeConfig, getPatternDefinition } from '../ai/patternLibrary';
import { CognitiveMeter } from '../components/CognitiveMeter';

type InsightsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Insights'>;
  route: RouteProp<RootStackParamList, 'Insights'>;
};

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const { getSession, deleteSession } = useSessionAnalyzer();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedTab, setSelectedTab] = useState<'transcript' | 'patterns' | 'analysis'>(
    'analysis'
  );

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    const loadedSession = await getSession(sessionId);
    if (loadedSession) {
      setSession(loadedSession);
    } else {
      Alert.alert('Error', 'Session not found', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(sessionId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!session) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  const modeConfig = getModeConfig(session.mode);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />

      {/* Header */}
      <LinearGradient colors={[AppColors.primaryDark, AppColors.primaryMid]} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.modeTag}>
            <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
            <Text style={styles.modeText}>{modeConfig.displayName}</Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dateText}>{formatDate(session.timestamp)}</Text>

        <View style={styles.statsRow}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Duration</Text>
            <Text style={styles.headerStatValue}>{formatDuration(session.duration)}</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Patterns</Text>
            <Text style={styles.headerStatValue}>{session.detectedPatterns.length}</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Words</Text>
            <Text style={styles.headerStatValue}>{session.cognitiveMetrics.totalWords}</Text>
          </View>
        </View>

        <View style={styles.focusSection}>
          <CognitiveMeter focusScore={session.cognitiveMetrics.focusScore} size={80} />
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'analysis' && styles.tabActive]}
          onPress={() => setSelectedTab('analysis')}
        >
          <Text style={[styles.tabText, selectedTab === 'analysis' && styles.tabTextActive]}>
            Analysis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'patterns' && styles.tabActive]}
          onPress={() => setSelectedTab('patterns')}
        >
          <Text style={[styles.tabText, selectedTab === 'patterns' && styles.tabTextActive]}>
            Patterns
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'transcript' && styles.tabActive]}
          onPress={() => setSelectedTab('transcript')}
        >
          <Text style={[styles.tabText, selectedTab === 'transcript' && styles.tabTextActive]}>
            Transcript
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {selectedTab === 'analysis' && (
          <View>
            {/* Key Insights */}
            {session.summary.keyInsights.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Key Insights</Text>
                {session.summary.keyInsights.map((insight, index) => (
                  <View key={index} style={styles.insightCard}>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tactical Suggestions */}
            {session.summary.tacticalSuggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 Tactical Suggestions</Text>
                {session.summary.tacticalSuggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionCard}>
                    <Text style={styles.suggestionNumber}>{index + 1}</Text>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Leverage Moments */}
            {session.summary.leverageMoments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✅ Leverage Moments</Text>
                {session.summary.leverageMoments.map((moment, index) => (
                  <View key={index} style={styles.momentCard}>
                    <Text style={styles.momentText}>{moment}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Missed Opportunities */}
            {session.summary.missedOpportunities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Missed Opportunities</Text>
                {session.summary.missedOpportunities.map((opportunity, index) => (
                  <View key={index} style={styles.opportunityCard}>
                    <Text style={styles.opportunityText}>{opportunity}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Cognitive Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧠 Cognitive Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{session.cognitiveMetrics.speechGaps}</Text>
                  <Text style={styles.metricLabel}>Speech Gaps</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>{session.cognitiveMetrics.fillerWords}</Text>
                  <Text style={styles.metricLabel}>Filler Words</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>
                    {Math.round(session.cognitiveMetrics.avgSpeechRate)}
                  </Text>
                  <Text style={styles.metricLabel}>WPM</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'patterns' && (
          <View>
            {session.detectedPatterns.map((pattern, index) => {
              const patternDef = getPatternDefinition(pattern.pattern);
              return (
                <View key={pattern.id} style={styles.patternCard}>
                  <View style={styles.patternHeader}>
                    <Text style={styles.patternName}>{patternDef.displayName}</Text>
                    <View style={styles.patternBadge}>
                      <Text style={styles.patternBadgeText}>
                        {Math.round(pattern.confidenceScore)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.patternDescription}>{patternDef.description}</Text>
                  <View style={styles.patternSuggestion}>
                    <Text style={styles.patternSuggestionLabel}>Suggestion:</Text>
                    <Text style={styles.patternSuggestionText}>{pattern.suggestion}</Text>
                  </View>
                  {pattern.context && (
                    <View style={styles.patternContext}>
                      <Text style={styles.patternContextText}>"{pattern.context}"</Text>
                    </View>
                  )}
                </View>
              );
            })}
            {session.detectedPatterns.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No patterns detected</Text>
              </View>
            )}
          </View>
        )}

        {selectedTab === 'transcript' && (
          <View>
            {session.transcript.map((chunk, index) => (
              <View key={chunk.id} style={styles.transcriptChunk}>
                <Text style={styles.transcriptTime}>
                  {new Date(chunk.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.transcriptText}>{chunk.text}</Text>
              </View>
            ))}
            {session.transcript.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No transcript available</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 24,
  },
  dateText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  headerStat: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  headerDivider: {
    width: 1,
    backgroundColor: AppColors.textMuted + '30',
  },
  focusSection: {
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: AppColors.surfaceCard,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: -6,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: AppColors.accentCyan,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  tabTextActive: {
    color: AppColors.textPrimary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: AppColors.surfaceCard,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.accentCyan,
  },
  insightText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    lineHeight: 20,
  },
  suggestionCard: {
    flexDirection: 'row',
    backgroundColor: AppColors.surfaceCard,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  suggestionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.accentViolet,
    marginRight: 12,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.textPrimary,
    lineHeight: 20,
  },
  momentCard: {
    backgroundColor: AppColors.success + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  momentText: {
    fontSize: 13,
    color: AppColors.textPrimary,
    lineHeight: 18,
  },
  opportunityCard: {
    backgroundColor: AppColors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  opportunityText: {
    fontSize: 13,
    color: AppColors.textPrimary,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: AppColors.surfaceCard,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.accentCyan,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  patternCard: {
    backgroundColor: AppColors.surfaceCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternName: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    flex: 1,
  },
  patternBadge: {
    backgroundColor: AppColors.accentCyan + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  patternBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.accentCyan,
  },
  patternDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  patternSuggestion: {
    backgroundColor: AppColors.primaryDark + '80',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  patternSuggestionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.textMuted,
    marginBottom: 4,
  },
  patternSuggestionText: {
    fontSize: 13,
    color: AppColors.textPrimary,
    lineHeight: 18,
  },
  patternContext: {
    padding: 10,
    backgroundColor: AppColors.primaryDark + '40',
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: AppColors.accentViolet,
  },
  patternContextText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
  transcriptChunk: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.textMuted + '20',
  },
  transcriptTime: {
    fontSize: 12,
    color: AppColors.textMuted,
    marginBottom: 6,
  },
  transcriptText: {
    fontSize: 15,
    color: AppColors.textPrimary,
    lineHeight: 22,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
});
