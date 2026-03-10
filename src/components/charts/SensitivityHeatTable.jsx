'use client';

import { INFLATIONS, RETURNS } from '../../engine/sensitivity';

function getColor(sip, min, max) {
  const ratio = (sip - min) / (max - min);
  if (ratio < 0.33) return '#dcfce7';
  if (ratio < 0.66) return '#fef9c3';
  return '#fee2e2';
}

export default function SensitivityHeatTable({ data, userInflation, userReturn }) {
  if (!data?.length) return null;

  const allSips = data.flatMap(row => row.cols.map(c => c.sip));
  const min = Math.min(...allSips);
  const max = Math.max(...allSips);

  const formatSIP = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${Math.round(val / 1000)}K`;
  };

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid #e2e6ed', overflowX: 'auto' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 12 }}>
        Sensitivity Analysis — SIP vs Inflation &amp; Return
      </p>

      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ padding: '6px 8px', color: '#919090', textAlign: 'center' }}>
              Inflation → <br /> Return ↓
            </th>
            {INFLATIONS.map(inf => (
              <th key={inf} style={{ padding: '6px 8px', color: '#919090', textAlign: 'center' }}>
                {inf}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RETURNS.map((ret, ri) => (
            <tr key={ret}>
              <td style={{ padding: '6px 8px', color: '#919090', textAlign: 'center', fontWeight: 600 }}>
                {ret}%
              </td>
              {data.map((row, ci) => {
                const cell = row.cols[ri];
                const isActive = row.inflation === userInflation && cell.return === userReturn;
                return (
                  <td
                    key={ci}
                    style={{
                      padding: '8px',
                      textAlign: 'center',
                      background: getColor(cell.sip, min, max),
                      border: isActive ? '2px solid #224c87' : '1px solid #e2e6ed',
                      borderRadius: 6,
                      fontWeight: isActive ? 700 : 400,
                      color: '#1a1a2e',
                      minWidth: 64,
                    }}
                  >
                    {formatSIP(cell.sip)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 11, color: '#919090', marginTop: 8 }}>
        🟢 Low SIP &nbsp; 🟡 Moderate &nbsp; 🔴 High SIP &nbsp;|&nbsp; Blue border = your current selection
      </p>
    </div>
  );
}