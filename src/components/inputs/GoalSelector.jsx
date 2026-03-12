import { GOAL_TYPES, GOAL_LABELS, COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function GoalSelector({ selectedGoal, onGoalChange, columns = 2 }) {
  const gridClass = columns === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4';
  return (
    <div className={`grid ${gridClass} gap-3`}>
      {GOAL_TYPES.map((goal) => {
        const isSelected = selectedGoal === goal;
        const parts = GOAL_LABELS[goal].split(' ');
        const icon = parts[0];
        const text = parts.slice(1).join(' ');

        return (
          <motion.button
            key={goal}
            whileHover={{ scale: 1.02, borderColor: '#224c87' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGoalChange(goal)}
            aria-label={`Select goal: ${text}`}
            aria-pressed={isSelected}
            className={`relative flex flex-col items-center justify-center rounded-[16px] border transition-all duration-150 focus:outline-none ${isSelected ? '' : 'hover:bg-white'}`}
            style={{
              background: isSelected ? '#e8eef7' : '#ffffff',
              border: isSelected ? '2px solid #224c87' : '1px solid #e2e6ed',
              boxShadow: '0 8px 32px rgba(34,76,135,0.12)',
              height: 80,
              padding: 12,
            }}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 flex items-center justify-center w-[18px] h-[18px] bg-[#224c87] text-white rounded-full text-[10px] font-bold shadow-sm">
                ✓
              </div>
            )}
            <div
              className="mb-2 flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: '#e8eef7' }}
            >
              <span className="text-[20px] leading-none">{icon}</span>
            </div>
            <span
              className="text-[12px] font-semibold text-center"
              style={{
                color: isSelected ? '#224c87' : COLORS.grey,
                fontFamily: isSelected ? 'Montserrat, sans-serif' : 'inherit',
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              {text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
