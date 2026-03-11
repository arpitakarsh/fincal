import { AnimatePresence, motion } from 'framer-motion';
import SliderInput from '@/components/inputs/SliderInput';
import { COLORS, SLIDER_RANGES } from '@/lib/constants';

export default function StepUpToggle({ stepUpEnabled, stepUpPercent, onToggle, onPercentChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: COLORS.text }}>
          Step-up SIP annually
        </span>
        <button
          role="switch"
          aria-checked={stepUpEnabled}
          aria-label="Toggle step-up SIP"
          onClick={onToggle}
          className="relative focus:outline-none"
          style={{
            width: 44,
            height: 24,
            borderRadius: 999,
            backgroundColor: stepUpEnabled ? COLORS.blue : COLORS.border,
            transition: 'background-color 0.2s',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: stepUpEnabled ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      </div>

      <AnimatePresence>
        {stepUpEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <SliderInput
              label={`Increase SIP annually by ${stepUpPercent}%`}
              value={stepUpPercent}
              min={SLIDER_RANGES.stepUp.min}
              max={SLIDER_RANGES.stepUp.max}
              step={SLIDER_RANGES.stepUp.step}
              unit="%"
              onChange={onPercentChange}
              locked={false}
              tooltip="Your SIP amount will increase by this % every year."
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}