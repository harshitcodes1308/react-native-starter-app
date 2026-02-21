import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppColors } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useSessionAnalyzer } from '../hooks/useSessionAnalyzer';
import { SessionSummaryCard } from '../components/SessionSummaryCard';
import { getAllModes } from '../ai/patternLibrary';
import { NegotiationMode, ModeConfig } from '../types/session';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { sessions, stats, isLoading, refreshSessions } = useSessionAnalyzer();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const allModes = getAllModes();

  useEffect(() => {
    // Refresh sessions when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      refreshSessions();
    });
    return unsubscribe;
  }, [navigation, refreshSessions]);

  const handleStartSession = (mode: NegotiationMode) => {
    setShowModeSelector(false);
    navigation.navigate('LiveSession', { mode });
  };

  const handleSessionPress = (sessionId: string) => {
    navigation.navigate('Insights', { sessionId });
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}min`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />

      <LinearGradient
        colors={[AppColors.primaryDark, '#0F1629', AppColors.primaryMid]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshSessions}
              tintColor={AppColors.accentCyan}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Latent</Text>
              <Text style={styles.subtitle}>Offline Meeting Intelligence</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Banner */}
          <View style={styles.privacyBanner}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>100% Private & Offline</Text>
              <Text style={styles.privacySubtitle}>
                All processing runs locally. No data ever leaves your device.
              </Text>
            </View>
          </View>

          {/* Stats Dashboard */}
          {stats && stats.totalSessions > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalSessions}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: AppColors.success }]}>
                    {Math.round(stats.avgFocusScore)}%
                  </Text>
                  <Text style={styles.statLabel}>Avg Focus</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{formatDuration(stats.avgDuration)}</Text>
                  <Text style={styles.statLabel}>Avg Time</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalPatterns}</Text>
                  <Text style={styles.statLabel}>Patterns</Text>
                </View>
              </View>
            </View>
          )}

          {/* Start New Session Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setShowModeSelector(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[AppColors.accentCyan, AppColors.accentViolet]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonIcon}>🎤</Text>
              <Text style={styles.startButtonText}>Start New Session</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Past Sessions */}
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>Past Sessions</Text>
            {sessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyText}>No sessions yet</Text>
                <Text style={styles.emptySubtext}>Start your first session to see insights</Text>
              </View>
            ) : (
              sessions.map((session) => (
                <SessionSummaryCard
                  key={session.id}
                  session={session}
                  onPress={() => handleSessionPress(session.id)}
                />
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Mode Selector Modal */}
      <Modal
        visible={showModeSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Mode</Text>
            <Text style={styles.modalSubtitle}>Choose your negotiation scenario</Text>

            <ScrollView style={styles.modesScroll}>
              {allModes.map((modeConfig: ModeConfig) => (
                <TouchableOpacity
                  key={modeConfig.mode}
                  style={styles.modeCard}
                  onPress={() => handleStartSession(modeConfig.mode)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
                  <View style={styles.modeInfo}>
                    <Text style={styles.modeTitle}>{modeConfig.displayName}</Text>
                    <Text style={styles.modeDescription}>{modeConfig.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModeSelector(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.accentCyan,
    marginTop: 4,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 12,
  },
  settingsIcon: {
    fontSize: 24,
  },
  privacyBanner: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: AppColors.surfaceCard + 'CC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.accentCyan + '33',
    marginBottom: 24,
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  privacySubtitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    lineHeight: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: AppColors.surfaceCard + '80',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.accentCyan,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  startButton: {
    marginBottom: 32,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: AppColors.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  startButtonIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  sessionsSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: AppColors.surfaceCard + '40',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: AppColors.textMuted + '40',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.primaryMid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 24,
  },
  modesScroll: {
    maxHeight: 400,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceCard,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modeIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: AppColors.surfaceCard,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
});
