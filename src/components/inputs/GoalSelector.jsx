import { GOAL_TYPES, GOAL_LABELS, COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';

export default function GoalSelector({ selectedGoal, onGoalChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            className={`relative flex flex-col items-center justify-center p-5 rounded-[16px] border transition-all duration-150 focus:outline-none ${isSelected ? 'bg-blue-50/50' : 'bg-slate-50 hover:bg-white'}`}
            style={{
              borderColor: isSelected ? COLORS.blue : '#e2e6ed',
              boxShadow: isSelected ? '0 4px 20px rgba(34,76,135,0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
            }}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 flex items-center justify-center w-[18px] h-[18px] bg-[#224c87] text-white rounded-full text-[10px] font-bold shadow-sm">
                ✓
              </div>
            )}
            <span className="text-3xl mb-2">{icon}</span>
            <span
              className="text-sm font-semibold text-center"
              style={{ color: isSelected ? COLORS.blue : COLORS.grey }}
            >
              {text}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}