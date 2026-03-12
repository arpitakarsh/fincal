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

  const formatSIP = (val) => {
    if (val >= 1000000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}k`;
    return `₹${val}`;
  };

  const returns = data[0].cols.map(c => c.return);

  return (
    <div className="w-full h-full min-w-[500px]">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="p-2 border border-gray-200 bg-gray-50 text-gray-500 font-medium text-left">
              Inflation ↓ \ Return →
            </th>
            {returns.map(r => (
              <th key={r} className={`p-2 border border-gray-200 text-center font-semibold ${r === userReturn ? 'bg-blue-50 text-[#224c87]' : 'bg-gray-50 text-gray-700'}`}>
                {r}%
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isUserInf = row.inflation === userInflation;
            return (
              <tr key={row.inflation}>
                <td className={`p-2 border border-gray-200 font-semibold ${isUserInf ? 'bg-blue-50 text-[#224c87]' : 'bg-gray-50 text-gray-700'}`}>
                  {row.inflation}%
                </td>
                {row.cols.map(col => {
                  const isUserActive = isUserInf && col.return === userReturn;
                  // Min/Max for color scaling
                  const minSIP = data[0].cols[data[0].cols.length - 1].sip; // highest return, lowest inflation
                  const maxSIP = data[data.length - 1].cols[0].sip; // lowest return, highest inflation
                  
                  return (
                    <td 
                      key={col.return} 
                      className="p-2 border border-gray-200 text-center font-medium transition-colors"
                      style={{
                        backgroundColor: isUserActive ? '#224c87' : getColor(col.sip, minSIP, maxSIP),
                        color: isUserActive ? '#fff' : '#1a1a2e',
                        borderWidth: isUserActive ? 2 : 1,
                        borderColor: isUserActive ? '#1a3a68' : '#e5e7eb',
                      }}
                    >
                      {formatSIP(col.sip)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}