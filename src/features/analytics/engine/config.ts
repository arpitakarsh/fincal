export const RETURN_BUCKETS = [
  { id: 'negative', label: 'Negative (<0%)', min: -Infinity, max: 0 },
  { id: 'low', label: '0-8%', min: 0, max: 8 },
  { id: 'moderate', label: '8-12%', min: 8, max: 12 },
  { id: 'high', label: '12-15%', min: 12, max: 15 },
  { id: 'very_high', label: '15-18%', min: 15, max: 18 },
  { id: 'exceptional', label: '18%+', min: 18, max: Infinity }
];

export const TARGET_HORIZONS = [1, 3, 5, 7, 10]; // Years
