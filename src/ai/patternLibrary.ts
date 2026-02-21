/**
 * 🔒 PRIVACY NOTICE
 * All pattern detection runs locally on device.
 * No data leaves this device.
 */

import { NegotiationPattern, NegotiationMode, ModeConfig } from '../types/session';

/**
 * Pattern definition with detection rules
 */
export interface PatternDefinition {
  pattern: NegotiationPattern;
  displayName: string;
  description: string;
  keywords: string[];
  regexPatterns: RegExp[];
  baseConfidence: number; // Base confidence score (0-100)
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
  contextClues?: string[]; // Additional words that boost confidence
}

/**
 * Complete pattern library for negotiation detection
 */
export const PATTERN_LIBRARY: Record<NegotiationPattern, PatternDefinition> = {
  [NegotiationPattern.ANCHORING]: {
    pattern: NegotiationPattern.ANCHORING,
    displayName: 'Anchoring',
    description: 'Setting initial price/expectation reference point',
    keywords: [
      'thinking around',
      'expecting',
      'market rate',
      'industry standard',
      'typical range',
      'usually',
      'normally',
      'average is',
      'benchmark',
      'comparable',
    ],
    regexPatterns: [
      /\b(thinking around|expecting|market rate)\b/i,
      /\b(industry standard|typical range)\b/i,
      /\b(usually|normally|average is)\b/i,
      /\b(benchmark|comparable)\b/i,
    ],
    baseConfidence: 75,
    severity: 'high',
    suggestions: [
      'Counter with your own anchor or acknowledge and pivot',
      'Ask for rationale behind their number',
      'Request breakdown of how they arrived at that figure',
      'Present alternative comparison points',
    ],
    contextClues: ['price', 'cost', 'budget', 'salary', 'compensation', 'fee'],
  },

  [NegotiationPattern.BUDGET_OBJECTION]: {
    pattern: NegotiationPattern.BUDGET_OBJECTION,
    displayName: 'Budget Objection',
    description: 'Claiming budget constraints or financial limitations',
    keywords: [
      'over budget',
      "can't afford",
      'too expensive',
      'out of our range',
      'budget constraints',
      'limited budget',
      'not in the budget',
      'tight budget',
      'beyond our means',
      'financial constraints',
    ],
    regexPatterns: [
      /\b(over budget|can't afford|too expensive)\b/i,
      /\b(out of (our|my) range|beyond (our|my) means)\b/i,
      /\b(budget constraints?|limited budget|tight budget)\b/i,
      /\b(not in the budget|financial constraints?)\b/i,
    ],
    baseConfidence: 80,
    severity: 'high',
    suggestions: [
      'Explore value-based pricing instead of cost',
      'Offer phased approach or payment plans',
      'Identify what IS in budget and work backwards',
      'Question: "What budget range were you expecting?"',
      'Demonstrate ROI or cost-benefit analysis',
    ],
    contextClues: ['money', 'cost', 'price', 'expensive', 'cheap', 'affordable'],
  },

  [NegotiationPattern.AUTHORITY_PRESSURE]: {
    pattern: NegotiationPattern.AUTHORITY_PRESSURE,
    displayName: 'Authority Pressure',
    description: 'Deferring to higher authority or claiming lack of decision power',
    keywords: [
      'check with',
      'need approval',
      'my boss',
      'my manager',
      'team decision',
      'not authorized',
      'run it by',
      'consult with',
      'committee',
      'board approval',
    ],
    regexPatterns: [
      /\b(check with|need approval|run it by)\b/i,
      /\b(my boss|my manager|my supervisor)\b/i,
      /\b(team decision|committee|board approval)\b/i,
      /\b(not authorized|can't decide|not my decision)\b/i,
    ],
    baseConfidence: 85,
    severity: 'medium',
    suggestions: [
      'Ask: "What would you recommend to your manager?"',
      'Identify who the real decision maker is',
      'Request meeting with all decision makers',
      'Ask about their decision-making process',
      'Offer to provide materials for their internal discussion',
    ],
    contextClues: ['decision', 'approve', 'authority', 'permission'],
  },

  [NegotiationPattern.TIME_PRESSURE]: {
    pattern: NegotiationPattern.TIME_PRESSURE,
    displayName: 'Time Pressure',
    description: 'Creating urgency or imposing deadlines',
    keywords: [
      'need this by',
      'deadline',
      'running out of time',
      'urgent',
      'asap',
      'time sensitive',
      'need to decide',
      'limited time',
      'offer expires',
      'ending soon',
    ],
    regexPatterns: [
      /\b(need this by|deadline|running out of time)\b/i,
      /\b(urgent|asap|time sensitive)\b/i,
      /\b(need to decide|have to decide|must decide)\b/i,
      /\b(limited time|offer expires|ending soon)\b/i,
    ],
    baseConfidence: 70,
    severity: 'medium',
    suggestions: [
      'Verify if deadline is real or artificial',
      'Ask: "What happens if we take more time?"',
      'Propose alternative timeline with benefits',
      "Don't let urgency compromise your position",
      'Create your own counterpressure if needed',
    ],
    contextClues: ['today', 'tomorrow', 'now', 'quickly', 'soon', 'immediately'],
  },

  [NegotiationPattern.DEFLECTION]: {
    pattern: NegotiationPattern.DEFLECTION,
    displayName: 'Deflection',
    description: 'Avoiding commitment or postponing decision',
    keywords: [
      'get back to you',
      'think about it',
      'need time',
      'let me consider',
      'circle back',
      'revisit this',
      'table this',
      'sleep on it',
      'mull it over',
      'not ready to decide',
    ],
    regexPatterns: [
      /\b(get back to you|circle back|revisit this)\b/i,
      /\b(think about it|need time|let me consider)\b/i,
      /\b(table this|sleep on it|mull it over)\b/i,
      /\b(not ready|need more time|need to think)\b/i,
    ],
    baseConfidence: 65,
    severity: 'medium',
    suggestions: [
      'Ask: "What specific concerns need more consideration?"',
      'Set a concrete follow-up date and time',
      'Identify what information would help them decide',
      'Clarify if this is interest or hesitation',
      'Offer to address concerns now if possible',
    ],
    contextClues: ['later', 'follow-up', 'consider', 'review', 'analyze'],
  },

  [NegotiationPattern.POSITIVE_SIGNAL]: {
    pattern: NegotiationPattern.POSITIVE_SIGNAL,
    displayName: 'Positive Signal',
    description: 'Expressions of interest, agreement, or enthusiasm',
    keywords: [
      'sounds good',
      'i like',
      'interested',
      'that works',
      'makes sense',
      'agree',
      'perfect',
      'exactly',
      'great',
      'love it',
    ],
    regexPatterns: [
      /\b(sounds? good|sounds? great|looks? good)\b/i,
      /\b(i like|interested|that works?)\b/i,
      /\b(makes? sense|i agree|perfect)\b/i,
      /\b(exactly|great|love it|fantastic)\b/i,
    ],
    baseConfidence: 80,
    severity: 'low',
    suggestions: [
      'Capitalize on positive momentum',
      'Move toward commitment: "Shall we proceed?"',
      'Clarify next steps while enthusiasm is high',
      'Lock in agreement on specific points',
    ],
    contextClues: ['yes', 'definitely', 'absolutely', 'certainly'],
  },

  [NegotiationPattern.NEGATIVE_SIGNAL]: {
    pattern: NegotiationPattern.NEGATIVE_SIGNAL,
    displayName: 'Negative Signal',
    description: 'Expressions of concern, disagreement, or rejection',
    keywords: [
      'not sure',
      'concerned',
      'hesitant',
      "don't think",
      'problem is',
      'issue with',
      'worried about',
      'not convinced',
      'skeptical',
      "doesn't work",
    ],
    regexPatterns: [
      /\b(not sure|concerned|hesitant)\b/i,
      /\b(don't think|doesn't work|won't work)\b/i,
      /\b(problem is|issue with|worried about)\b/i,
      /\b(not convinced|skeptical|doubtful)\b/i,
    ],
    baseConfidence: 75,
    severity: 'high',
    suggestions: [
      'Probe for specific objection: "What specifically concerns you?"',
      'Address concerns directly and empathetically',
      'Provide evidence or examples to counter skepticism',
      'Explore alternative solutions',
      "Don't ignore - acknowledge and address",
    ],
    contextClues: ['but', 'however', 'unfortunately', 'no'],
  },

  [NegotiationPattern.COMMITMENT_LANGUAGE]: {
    pattern: NegotiationPattern.COMMITMENT_LANGUAGE,
    displayName: 'Commitment Language',
    description: 'Strong commitment or decision-making language',
    keywords: [
      "let's do it",
      "i'll take it",
      "we're in",
      'deal',
      'agreed',
      "let's proceed",
      'move forward',
      'ready to start',
      "let's make it happen",
      'commit',
    ],
    regexPatterns: [
      /\b(let's do it|i'll take it|we're in)\b/i,
      /\b(deal|agreed|sold)\b/i,
      /\b(let's proceed|move forward|ready to start)\b/i,
      /\b(let's make it happen|commit|committed)\b/i,
    ],
    baseConfidence: 90,
    severity: 'low',
    suggestions: [
      'Document the agreement immediately',
      'Clarify all terms before finalizing',
      'Set clear next steps and timeline',
      'Get confirmation in writing',
      'Celebrate the agreement!',
    ],
    contextClues: ['yes', 'okay', 'confirm', 'final'],
  },
};

/**
 * Mode configurations with pattern weights
 */
export const MODE_CONFIGS: Record<NegotiationMode, ModeConfig> = {
  [NegotiationMode.JOB_INTERVIEW]: {
    mode: NegotiationMode.JOB_INTERVIEW,
    displayName: 'Job Interview',
    description: 'Optimize for employment negotiations and interview scenarios',
    icon: '💼',
    patternWeights: {
      [NegotiationPattern.ANCHORING]: 0.9,
      [NegotiationPattern.BUDGET_OBJECTION]: 1.0,
      [NegotiationPattern.AUTHORITY_PRESSURE]: 0.8,
      [NegotiationPattern.TIME_PRESSURE]: 0.7,
      [NegotiationPattern.DEFLECTION]: 0.9,
      [NegotiationPattern.POSITIVE_SIGNAL]: 1.0,
      [NegotiationPattern.NEGATIVE_SIGNAL]: 1.0,
      [NegotiationPattern.COMMITMENT_LANGUAGE]: 1.0,
    },
  },

  [NegotiationMode.SALES]: {
    mode: NegotiationMode.SALES,
    displayName: 'Sales',
    description: 'Optimize for sales conversations and client negotiations',
    icon: '💰',
    patternWeights: {
      [NegotiationPattern.ANCHORING]: 1.0,
      [NegotiationPattern.BUDGET_OBJECTION]: 1.0,
      [NegotiationPattern.AUTHORITY_PRESSURE]: 0.9,
      [NegotiationPattern.TIME_PRESSURE]: 0.8,
      [NegotiationPattern.DEFLECTION]: 0.8,
      [NegotiationPattern.POSITIVE_SIGNAL]: 1.0,
      [NegotiationPattern.NEGATIVE_SIGNAL]: 1.0,
      [NegotiationPattern.COMMITMENT_LANGUAGE]: 1.0,
    },
  },

  [NegotiationMode.STARTUP_PITCH]: {
    mode: NegotiationMode.STARTUP_PITCH,
    displayName: 'Startup Pitch',
    description: 'Optimize for investor pitches and funding negotiations',
    icon: '🚀',
    patternWeights: {
      [NegotiationPattern.ANCHORING]: 0.8,
      [NegotiationPattern.BUDGET_OBJECTION]: 0.9,
      [NegotiationPattern.AUTHORITY_PRESSURE]: 1.0,
      [NegotiationPattern.TIME_PRESSURE]: 0.9,
      [NegotiationPattern.DEFLECTION]: 0.7,
      [NegotiationPattern.POSITIVE_SIGNAL]: 1.0,
      [NegotiationPattern.NEGATIVE_SIGNAL]: 1.0,
      [NegotiationPattern.COMMITMENT_LANGUAGE]: 1.0,
    },
  },

  [NegotiationMode.SALARY_RAISE]: {
    mode: NegotiationMode.SALARY_RAISE,
    displayName: 'Salary Raise',
    description: 'Optimize for salary negotiation and raise discussions',
    icon: '📈',
    patternWeights: {
      [NegotiationPattern.ANCHORING]: 1.0,
      [NegotiationPattern.BUDGET_OBJECTION]: 0.9,
      [NegotiationPattern.AUTHORITY_PRESSURE]: 0.7,
      [NegotiationPattern.TIME_PRESSURE]: 0.6,
      [NegotiationPattern.DEFLECTION]: 0.8,
      [NegotiationPattern.POSITIVE_SIGNAL]: 1.0,
      [NegotiationPattern.NEGATIVE_SIGNAL]: 1.0,
      [NegotiationPattern.COMMITMENT_LANGUAGE]: 1.0,
    },
  },
};

/**
 * Get all pattern definitions as array
 */
export const getAllPatterns = (): PatternDefinition[] => {
  return Object.values(PATTERN_LIBRARY);
};

/**
 * Get pattern definition by type
 */
export const getPatternDefinition = (pattern: NegotiationPattern): PatternDefinition => {
  return PATTERN_LIBRARY[pattern];
};

/**
 * Get mode configuration
 */
export const getModeConfig = (mode: NegotiationMode): ModeConfig => {
  return MODE_CONFIGS[mode];
};

/**
 * Get all available modes
 */
export const getAllModes = (): ModeConfig[] => {
  return Object.values(MODE_CONFIGS);
};

/**
 * Filler words for cognitive load detection
 */
export const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'i mean',
  'sort of',
  'kind of',
  'basically',
  'actually',
  'literally',
  'just',
  'right',
  'okay',
  'so',
  'well',
  'anyway',
];

/**
 * Regex pattern to match filler words
 */
export const FILLER_WORD_PATTERN = new RegExp(`\\b(${FILLER_WORDS.join('|')})\\b`, 'gi');
