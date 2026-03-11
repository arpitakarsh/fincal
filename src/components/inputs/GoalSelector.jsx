import { GOAL_TYPES, GOAL_LABELS, COLORS } from '@/lib/constants';

export default function GoalSelector({ selectedGoal, onGoalChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {GOAL_TYPES.map((goal) => {
        const isSelected = selectedGoal === goal;
        return (
          <button
            key={goal}
            onClick={() => onGoalChange(goal)}
            aria-label={`Select goal: ${GOAL_LABELS[goal]}`}
            aria-pressed={isSelected}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none min-h-[44px] min-w-[44px]"
            style={{
              backgroundColor: isSelected ? COLORS.blue : COLORS.card,
              color: isSelected ? '#ffffff' : COLORS.text,
              border: `1.5px solid ${isSelected ? COLORS.blue : COLORS.border}`,
              boxShadow: isSelected ? '0 2px 8px rgba(34,76,135,0.15)' : 'none',
            }}
          >
            {GOAL_LABELS[goal]}
          </button>
        );
      })}
    </div>
  );
}