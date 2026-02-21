import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Animated } from 'react-native';
import { TranscriptChunk } from '../types/session';
import { AppColors } from '../theme';
import { getPatternDefinition } from '../ai/patternLibrary';

interface LiveTranscriptProps {
  transcript: TranscriptChunk[];
  highlightPatterns?: boolean;
}

/**
 * LiveTranscript - Auto-scrolling transcript display with pattern highlighting
 */
export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  highlightPatterns = true,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    if (transcript.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [transcript.length, fadeAnim]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderItem = ({ item, index }: { item: TranscriptChunk; index: number }) => {
    const isLatest = index === transcript.length - 1;

    return (
      <Animated.View
        style={[
          styles.transcriptItem,
          item.hasPattern && highlightPatterns && styles.transcriptItemHighlighted,
          { opacity: isLatest ? fadeAnim : 1 },
        ]}
      >
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
        <Text style={styles.transcriptText}>{item.text}</Text>
        {item.hasPattern && highlightPatterns && (
          <View style={styles.patternIndicator}>
            <Text style={styles.patternIndicatorText}>Pattern Detected</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  if (transcript.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎤</Text>
        <Text style={styles.emptyText}>Start speaking...</Text>
        <Text style={styles.emptySubtext}>Your transcript will appear here</Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={transcript}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      indicatorStyle="white"
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  transcriptItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: AppColors.surfaceCard + '80',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.accentCyan + '40',
  },
  transcriptItemHighlighted: {
    backgroundColor: AppColors.accentViolet + '20',
    borderLeftColor: AppColors.accentViolet,
    borderLeftWidth: 4,
  },
  timestamp: {
    fontSize: 11,
    color: AppColors.textMuted,
    marginBottom: 6,
    fontWeight: '500',
  },
  transcriptText: {
    fontSize: 15,
    color: AppColors.textPrimary,
    lineHeight: 22,
  },
  patternIndicator: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: AppColors.accentViolet + '30',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  patternIndicatorText: {
    fontSize: 11,
    color: AppColors.accentViolet,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
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
});
