import { COLORS } from '@/lib/constants';

export default function Header({ tabBar }) {
  return (
    <div className="app-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <header
        className="w-full flex items-center justify-between px-6"
        style={{
          backgroundColor: '#f8f9fb',
          borderBottom: '1px solid #e2e6ed',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          position: 'relative',
          height: 'calc(56px + env(safe-area-inset-top))',
          paddingTop: 'env(safe-area-inset-top)',
          width: '100%',
        }}
      >
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="FinCal Logo" 
            style={{ height: 42, width: 'auto', objectFit: 'contain' }} 
          />
          <span
            style={{
              background: '#f59e0b',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 700,
              padding: '6px',
              borderRadius: 999,
              lineHeight: 1,
            }}
          >
            Beta
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {tabBar}
        </div>
      </header>
    </div>
  );
}
