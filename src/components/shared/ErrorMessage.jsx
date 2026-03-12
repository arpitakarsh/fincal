import { motion } from 'framer-motion';
import { ANIMATION, COLORS } from '../../lib/constants';

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ x: 0, opacity: 0 }}
      animate={{ 
        x: ANIMATION.shakeKeyframes,
        opacity: 1 
      }}
      transition={{ duration: 0.4 }}
      className="mt-1 flex items-center gap-1.5 text-[13px] font-medium"
      style={{ color: COLORS.red }}
      role="alert"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </motion.div>
  );
}
