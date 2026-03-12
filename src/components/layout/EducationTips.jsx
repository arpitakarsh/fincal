import { COLORS } from '@/lib/constants';

export default function EducationTips({ goalType }) {
  if (goalType !== 'education') return null;

  return (
    <div className="mb-4 rounded-2xl border bg-blue-50 p-5 shadow-sm mt-6" style={{ borderColor: `${COLORS.blue}40` }}>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm" style={{ color: COLORS.blue }}>
          🎓
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Education Planning Tips</h3>
          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex gap-2">
              <span style={{ color: COLORS.blue }}>•</span>
              <span><strong>Inflation is higher here:</strong> Education inflation in India is typically around 10-12%, significantly higher than general inflation.</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: COLORS.blue }}>•</span>
              <span><strong>Start early:</strong> An early start allows the power of compounding to do the heavy lifting, reducing your monthly burden.</span>
            </li>
             <li className="flex gap-2">
              <span style={{ color: COLORS.blue }}>•</span>
              <span><strong>Review constantly:</strong> Course fees and cost of living change rapidly. Re-evaluate this goal every 1-2 years.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
