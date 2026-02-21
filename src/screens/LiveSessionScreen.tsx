import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AppColors } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { useLiveTranscription } from '../hooks/useLiveTranscription';
import { LiveTranscript } from '../components/LiveTranscript';
import { SuggestionCard } from '../components/SuggestionCard';
import { CognitiveMeter } from '../components/CognitiveMeter';
import { getModeConfig } from '../ai/patternLibrary';

type LiveSessionScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'LiveSession'>;
  route: RouteProp<RootStackParamList, 'LiveSession'>;
};

export const LiveSessionScreen: React.FC<LiveSessionScreenProps> = ({ navigation, route }) => {
  const { mode } = route.params;
  const { sessionState, isRecording, startSession, stopSession, cancelSession, error } =
    useLiveTranscription();
  const [hasStarted, setHasStarted] = useState(false);

  const modeConfig = getModeConfig(mode);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK' }]);
    }
  }, [error]);

  useEffect(() => {
    // Auto-start session
    if (!hasStarted) {
      setHasStarted(true);
      startSession(mode).catch((err) => {
        console.error('Failed to start session:', err);
        navigation.goBack();
      });
    }
  }, [hasStarted, mode, startSession, navigation]);

  const handleStop = () => {
    Alert.alert(
      'Stop Session',
      'Are you sure you want to stop this session? Your insights will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            const session = await stopSession();
            if (session) {
              navigation.navigate('Insights', { sessionId: session.id });
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel? This session will not be saved.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelSession();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get top 3 most recent patterns for suggestions
  const recentPatterns = sessionState.detectedPatterns.slice(-3).reverse();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />

      {/* Top Bar */}
      <LinearGradient colors={[AppColors.primaryDark, AppColors.primaryMid]} style={styles.topBar}>
        <View style={styles.topBarContent}>
          <View style={styles.topBarLeft}>
            <View style={styles.modeTag}>
              <Text style={styles.modeIcon}>{modeConfig.icon}</Text>
              <Text style={styles.modeText}>{modeConfig.displayName}</Text>
            </View>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>{formatDuration(sessionState.duration)}</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <CognitiveMeter
              focusScore={sessionState.currentFocusScore}
              size={60}
              showLabel={false}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Transcript */}
      <View style={styles.transcriptContainer}>
        <LiveTranscript transcript={sessionState.transcript} highlightPatterns />
      </View>

      {/* Suggestions Panel */}
      {recentPatterns.length > 0 && (
        <View style={styles.suggestionsPanel}>
          <Text style={styles.suggestionsTitle}>💡 Live Suggestions</Text>
          {recentPatterns.map((pattern) => (
            <SuggestionCard key={pattern.id} pattern={pattern} />
          ))}
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stopButton} onPress={handleStop} activeOpacity={0.8}>
          <LinearGradient colors={[AppColors.error, '#C53030']} style={styles.stopButtonGradient}>
            <Text style={styles.stopButtonIcon}>⏹️</Text>
            <Text style={styles.stopButtonText}>Stop Session</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Audio Level Visualizer (optional) */}
      {sessionState.audioLevel > 0 && (
        <View style={styles.audioVisualizer}>
          <View
            style={[
              styles.audioBar,
              {
                width: `${Math.min(sessionState.audioLevel * 100, 100)}%`,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryDark,
  },
  topBar: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.textMuted + '20',
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarLeft: {
    flex: 1,
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.accentCyan + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
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
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.error,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  topBarRight: {
    marginLeft: 16,
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: AppColors.primaryMid,
  },
  suggestionsPanel: {
    backgroundColor: AppColors.primaryDark,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.textMuted + '20',
    maxHeight: 300,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: AppColors.primaryDark,
    borderTopWidth: 1,
    borderTopColor: AppColors.textMuted + '20',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
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
  stopButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: AppColors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stopButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  audioVisualizer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: AppColors.surfaceCard,
  },
  audioBar: {
    height: '100%',
    backgroundColor: AppColors.accentCyan,
  },
});
