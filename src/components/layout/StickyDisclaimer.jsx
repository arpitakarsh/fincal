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
        zIndex: 30,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e6ed',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: '#919090',
          margin: 0,
          lineHeight: 1.5,
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Mutual Fund investments are subject to market risks. All figures are estimated and illustrative only. This does not constitute financial advice.
      </p>
    </div>
  );
}
