import { COLORS } from '@/lib/constants';

export default function Header() {
  return (
    <header
      className="w-full flex items-center justify-between px-6 py-4"
      style={{
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        zIndex: 50,
        position: 'relative'
      }}
    >
      <span
        className="text-xl tracking-tight"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          color: COLORS.blue,
        }}
      >
        FinCal
      </span>
      <span
        className="text-sm hidden sm:block"
        style={{ color: COLORS.grey, fontFamily: 'Arial, sans-serif' }}
      >
        Goal-Based Investment Calculator
      </span>
    </header>
  );
}