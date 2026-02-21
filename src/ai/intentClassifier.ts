/**
 * 🔒 PRIVACY NOTICE
 * All pattern classification runs locally on device using rule-based NLP.
 * No external API calls. No data leaves this device.
 */

import {
  NegotiationPattern,
  NegotiationMode,
  DetectedPattern,
  PatternSeverity,
} from '../types/session';
import { PATTERN_LIBRARY, PatternDefinition, getModeConfig } from './patternLibrary';
import { calculateConfidenceScore, determineSeverity } from './scoringEngine';

/**
 * Match result from pattern detection
 */
interface MatchResult {
  pattern: NegotiationPattern;
  keywordMatches: number;
  contextMatches: number;
  matchedText: string;
}

/**
 * Classify text and detect negotiation patterns
 */
export const classifyIntent = (
  text: string,
  mode: NegotiationMode,
  sensitivityMultiplier: number = 1.0
): DetectedPattern[] => {
  const detectedPatterns: DetectedPattern[] = [];
  const lowerText = text.toLowerCase();
  const timestamp = Date.now();

  // Check each pattern
  for (const pattern of Object.values(NegotiationPattern)) {
    const patternDef = PATTERN_LIBRARY[pattern];
    const matchResult = matchPattern(lowerText, patternDef);

    if (matchResult.keywordMatches > 0) {
      // Get mode-specific weight
      const modeConfig = getModeConfig(mode);
      const patternWeight = modeConfig.patternWeights[pattern];

      // Calculate confidence score
      const confidenceScore = calculateConfidenceScore(patternDef.baseConfidence, {
        keywordMatches: matchResult.keywordMatches,
        contextMatches: matchResult.contextMatches,
        patternWeight,
        sensitivityMultiplier,
      });

      // Only include if confidence meets minimum threshold (50)
      if (confidenceScore >= 50) {
        const severity = determineSeverity(confidenceScore);

        // Pick random suggestion from pattern definition
        const suggestion = pickRandomSuggestion(patternDef.suggestions);

        detectedPatterns.push({
          id: `${pattern}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
          pattern,
          confidenceScore,
          suggestion,
          severity,
          timestamp,
          transcript: text,
          context: matchResult.matchedText,
        });
      }
    }
  }

  // Sort by confidence score (highest first)
  return detectedPatterns.sort((a, b) => b.confidenceScore - a.confidenceScore);
};

/**
 * Match a single pattern against text
 */
const matchPattern = (lowerText: string, patternDef: PatternDefinition): MatchResult => {
  let keywordMatches = 0;
  let contextMatches = 0;
  const matchedPhrases: string[] = [];

  // Check keyword matches
  for (const keyword of patternDef.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      keywordMatches++;
      matchedPhrases.push(keyword);
    }
  }

  // Check regex pattern matches
  for (const regex of patternDef.regexPatterns) {
    const matches = lowerText.match(regex);
    if (matches) {
      keywordMatches += matches.length;
      matchedPhrases.push(...matches);
    }
  }

  // Check context clues (boost confidence)
  if (patternDef.contextClues) {
    for (const clue of patternDef.contextClues) {
      if (lowerText.includes(clue.toLowerCase())) {
        contextMatches++;
      }
    }
  }

  return {
    pattern: patternDef.pattern,
    keywordMatches,
    contextMatches,
    matchedText: matchedPhrases.slice(0, 3).join(', '), // First 3 matches
  };
};

/**
 * Pick a random suggestion from array
 */
const pickRandomSuggestion = (suggestions: string[]): string => {
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

/**
 * Analyze multiple transcript chunks together
 * Useful for analyzing last N seconds of conversation
 */
export const analyzeTranscriptWindow = (
  chunks: Array<{ text: string; timestamp: number }>,
  mode: NegotiationMode,
  sensitivityMultiplier: number = 1.0,
  windowSize: number = 3 // Last 3 chunks by default
): DetectedPattern[] => {
  // Take last N chunks
  const recentChunks = chunks.slice(-windowSize);
  const combinedText = recentChunks.map((c) => c.text).join(' ');

  return classifyIntent(combinedText, mode, sensitivityMultiplier);
};

/**
 * Check if text contains specific pattern (quick check)
 */
export const containsPattern = (text: string, pattern: NegotiationPattern): boolean => {
  const patternDef = PATTERN_LIBRARY[pattern];
  const lowerText = text.toLowerCase();

  // Quick keyword check
  for (const keyword of patternDef.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  // Regex check
  for (const regex of patternDef.regexPatterns) {
    if (regex.test(lowerText)) {
      return true;
    }
  }

  return false;
};

/**
 * Get suggested response for a pattern
 */
export const getSuggestionForPattern = (
  pattern: NegotiationPattern,
  randomize: boolean = true
): string => {
  const patternDef = PATTERN_LIBRARY[pattern];

  if (randomize) {
    return pickRandomSuggestion(patternDef.suggestions);
  }

  return patternDef.suggestions[0];
};

/**
 * Filter patterns by severity
 */
export const filterBySeverity = (
  patterns: DetectedPattern[],
  minSeverity: PatternSeverity
): DetectedPattern[] => {
  const severityOrder: Record<PatternSeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  const minLevel = severityOrder[minSeverity];

  return patterns.filter((p) => severityOrder[p.severity] >= minLevel);
};

/**
 * Get most common pattern from array
 */
export const getMostCommonPattern = (patterns: DetectedPattern[]): NegotiationPattern | null => {
  if (patterns.length === 0) return null;

  const counts: Record<string, number> = {};

  patterns.forEach((p) => {
    counts[p.pattern] = (counts[p.pattern] || 0) + 1;
  });

  let maxCount = 0;
  let mostCommon: NegotiationPattern | null = null;

  Object.entries(counts).forEach(([pattern, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = pattern as NegotiationPattern;
    }
  });

  return mostCommon;
};
