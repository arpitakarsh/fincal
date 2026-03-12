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
          <div
            style={{
              width: 18,
              height: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
            }}
            aria-hidden="true"
          >
            {[6, 10, 14].map((h, i) => (
              <div key={i} style={{ alignSelf: 'end', height: h, background: '#224c87', borderRadius: 2 }} />
            ))}
          </div>
          <span
            className="text-xl tracking-tight"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              color: '#224c87',
            }}
          >
            Fin<span style={{ color: '#da3832' }}>Cal</span>
          </span>
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
