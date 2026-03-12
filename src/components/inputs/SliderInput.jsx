import { useState } from 'react';
import * as RadixSlider from '@radix-ui/react-slider';
import Tooltip from '@/components/shared/Tooltip';
import { COLORS } from '@/lib/constants';

export default function SliderInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  locked,
  tooltip,
  onDragStart,
  onDragEnd,
  bottomContext,
}) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: COLORS.text }}>
          {label}
        </span>
        <div className="flex items-center gap-1">
          {tooltip && (
            <Tooltip content={tooltip}>
              <button
                aria-label={`Info about ${label}`}
                className="text-sm leading-none focus:outline-none"
                style={{ color: COLORS.grey }}
                tabIndex={0}
              >
                ℹ️
              </button>
            </Tooltip>
          )}
          <span
            className="text-sm font-semibold px-2 py-0.5 rounded-md"
            style={{ backgroundColor: COLORS.lightBlue, color: COLORS.blue }}
          >
            {value}{unit}
          </span>
        </div>
      </div>

      <RadixSlider.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={locked}
        onValueChange={([val]) => onChange(val)}
        onPointerDown={() => {
          setIsDragging(true);
          if (onDragStart) onDragStart();
        }}
        onPointerUp={() => {
          setIsDragging(false);
          if (onDragEnd) onDragEnd();
        }}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        className="relative flex items-center w-full"
        style={{ height: 44 }}
      >
        <RadixSlider.Track
          className="relative grow rounded-full transition-colors duration-200"
          style={{
            height: 8,
            backgroundColor: locked ? '#e2e6ed' : '#e8eef7',
          }}
        >
          <RadixSlider.Range
            className="absolute h-full rounded-full"
            style={{ backgroundColor: locked ? COLORS.grey : COLORS.blue }}
          />
        </RadixSlider.Track>

        <RadixSlider.Thumb
          className="block rounded-full focus:outline-none transition-all duration-150 ease-out"
          style={{
            width: 24,
            height: 24,
            backgroundColor: locked ? COLORS.grey : '#fff',
            border: `3px solid ${locked ? COLORS.grey : COLORS.blue}`,
            boxShadow: isDragging ? `0 0 0 3px rgba(34,76,135,0.2)` : '0 1px 4px rgba(0,0,0,0.15)',
            cursor: locked ? 'not-allowed' : 'pointer',
            outline: 'none',
            transition: 'box-shadow 0.15s',
          }}
          onFocus={(e) => {
            if (!locked) e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.blue}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
          }}
        />
      </RadixSlider.Root>

      <div className="flex justify-between items-center mt-1">
        <span className="text-xs" style={{ color: COLORS.grey }}>{min}{unit}</span>
        {bottomContext && (
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
            {bottomContext}
          </span>
        )}
        <span className="text-xs" style={{ color: COLORS.grey }}>{max}{unit}</span>
      </div>
    </div>
  );
}