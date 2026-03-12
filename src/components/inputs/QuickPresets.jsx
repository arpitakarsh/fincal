import { QUICK_PRESETS, COLORS } from '@/lib/constants';

export default function QuickPresets({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" style={{ color: COLORS.text }}>
        Quick Presets
      </span>
      <div className="flex flex-col sm:flex-row gap-2">
        {QUICK_PRESETS.map((preset) => {
          const isActive = Number(value) === preset.value;
          return (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              aria-label={`Set goal amount to ${preset.label}`}
              aria-pressed={isActive}
              className="flex-1 py-2 px-3 text-sm font-medium rounded-full transition-all duration-200 focus:outline-none min-h-[44px]"
              style={{
                backgroundColor: isActive ? '#224c87' : '#ffffff',
                color: isActive ? '#ffffff' : '#0f172a',
                border: `1.5px solid ${isActive ? '#224c87' : '#e2e6ed'}`,
                fontWeight: isActive ? 600 : 500,
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