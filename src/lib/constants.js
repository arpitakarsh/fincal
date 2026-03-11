export const COLORS = {
  blue:         '#224c87',
  red:          '#da3832',
  grey:         '#919090',
  bg:           '#f8f9fb',
  card:         '#ffffff',
  text:         '#1a1a2e',
  border:       '#e2e6ed',
  lightBlue:    '#e8eef7',
  green:        '#2e7d32',
  amber:        '#d97706',
  conservative: '#64748b',
  moderate:     '#224c87',
  aggressive:   '#059669',
};

export const GOAL_TYPES = ['house', 'education', 'healthcare', 'wedding', 'travel', 'car', 'general'];

export const GOAL_LABELS = {
  house:      '🏠 House',
  education:  '🎓 Education',
  healthcare: '🏥 Healthcare',
  wedding:    '💒 Wedding',
  travel:     '✈️ Travel',
  car:        '🚗 Car',
  general:    '🎯 General',
};

export const SCENARIOS = [
  { id: 'conservative', label: 'Conservative', return: 8,  color: '#64748b' },
  { id: 'moderate',     label: 'Moderate',     return: 10, color: '#224c87' },
  { id: 'aggressive',   label: 'Aggressive',   return: 12, color: '#059669' },
];

export const RISK_PROFILES = [
  { id: 'safe',     label: 'Safe',     return: 8  },
  { id: 'balanced', label: 'Balanced', return: 10 },
  { id: 'growth',   label: 'Growth',   return: 12 },
];

export const QUICK_PRESETS = [
  { label: '₹50L', value: 5000000  },
  { label: '₹75L', value: 7500000  },
  { label: '₹1Cr', value: 10000000 },
];

export const DEFAULT_STATE = {
  goalType:       'house',
  presentCost:    5000000,
  years:          10,
  inflation:      9,
  annualReturn:   12,
  riskProfile:    'growth',
  stepUpEnabled:  false,
  stepUpPercent:  10,
  lumpsumEnabled: false,
  lumpsumAmount:  0,
};

export const SLIDER_RANGES = {
  presentCost:  { min: 100000,  max: 100000000, step: 50000 },
  years:        { min: 1,       max: 40,        step: 1     },
  inflation:    { min: 1,       max: 20,        step: 0.5   },
  annualReturn: { min: 1,       max: 30,        step: 0.5   },
  stepUp:       { min: 1,       max: 50,        step: 1     },
  lumpsum:      { min: 0,       max: 50000000,  step: 50000 },
};

export const BREAKPOINTS = { sm: 480, md: 768, lg: 1024, xl: 1280 };

export const ANIMATION = {
  staggerChildren: 0.1,
  chartDebounce:   300,
  aiDebounce:      1500,
  shakeKeyframes:  [-4, 4, -4, 0],
};

export const DISCLAIMER =
  'Mutual Fund investments are subject to market risks. Read all scheme related documents carefully. ' +
  'Past performance is not indicative of future returns. The calculator is for illustrative purposes only ' +
  'and does not constitute financial advice. All figures are estimated and assumed values only.';