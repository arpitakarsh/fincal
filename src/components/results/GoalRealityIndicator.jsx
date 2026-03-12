'use client';

import AnimatedCircularProgressBar from '../ui/AnimatedCircularProgressBar';
import { computeConfidenceScore } from '../../engine/validators';

export default function GoalRealityIndicator({ presentCost, years, inflation, annualReturn, goalType }) {
  if (!presentCost || !years || inflation == null || annualReturn == null) return null;

  const confidenceScore = computeConfidenceScore({
    presentCost,
    years,
    inflation,
    annualReturn,
    goalType,
  });

  return (
    <div
      className="mb-4 rounded-2xl border border-gray-100 bg-white p-5"
      style={{ boxShadow: '0 8px 32px rgba(34,76,135,0.12)' }}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <AnimatedCircularProgressBar
          value={confidenceScore}
          gaugePrimaryColor="#224c87"
          gaugeSecondaryColor="rgba(34, 76, 135, 0.1)"
        />
        <div
          className="text-[12px] font-[600] tracking-wide uppercase"
          style={{ color: '#1a1a2e', fontFamily: 'Montserrat, sans-serif' }}
        >
          Confidence Indicator
        </div>
        <div
          className="text-[11px] text-center"
          style={{ color: '#919090', fontFamily: 'Arial, sans-serif' }}
        >
          * Indicative only. Not a guarantee of returns or goal achievement.
        </div>
      </div>
    </div>
  );
}
