import { DISCLAIMER, COLORS } from '@/lib/constants';

export default function StickyDisclaimer() {
  return (
    <div
      role="contentinfo"
      aria-label="Compliance disclaimer"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: COLORS.card,
        borderTop: `1px solid ${COLORS.border}`,
        padding: '8px 16px',
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: COLORS.grey,
          margin: 0,
          lineHeight: 1.5,
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {DISCLAIMER}
      </p>
    </div>
  );
}