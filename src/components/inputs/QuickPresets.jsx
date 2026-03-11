import { QUICK_PRESETS, COLORS } from '@/lib/constants';

export default function QuickPresets({ presentCost, onPresetSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Quick Presets
      </span>
      <div className="flex gap-2">
        {QUICK_PRESETS.map((preset) => {
          const isActive = Number(presentCost) === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => onPresetSelect(preset.value)}
              aria-label={`Set goal amount to ${preset.label}`}
              aria-pressed={isActive}
              className="flex-1 py-2 px-3 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none min-h-[44px]"
              style={{
                backgroundColor: isActive ? COLORS.lightBlue : COLORS.card,
                color: isActive ? COLORS.blue : COLORS.text,
                border: `1.5px solid ${isActive ? COLORS.blue : COLORS.border}`,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}