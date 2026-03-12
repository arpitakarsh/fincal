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

  // Find the row matching user's inflation (or closest)
  const currentRow = data.find(r => r.inflation === userInflation) || data[Math.floor(data.length / 2)];
  
  if (!currentRow) return null;

  const currentCell = currentRow.cols.find(c => c.return === userReturn) || currentRow.cols[Math.floor(currentRow.cols.length / 2)];
  
  // Find a lower return and higher return scenario
  const sortedCols = [...currentRow.cols].sort((a, b) => a.return - b.return);
  const lowerCell = sortedCols.find(c => c.return < currentCell.return) || sortedCols[0];
  const higherCell = sortedCols.find(c => c.return > currentCell.return) || sortedCols[sortedCols.length - 1];

  const formatSIP = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">

      <div className="flex flex-col gap-3">
        {lowerCell && lowerCell.return !== currentCell.return && (
          <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
            <span className="text-sm text-red-800">If returns fall to <strong>{lowerCell.return}%</strong></span>
            <span className="text-sm font-bold text-red-700">SIP increases to {formatSIP(lowerCell.sip)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 border border-[#224c87]">
          <span className="text-sm text-[#224c87]">Expected Return <strong>{currentCell.return}%</strong></span>
          <span className="text-sm font-bold text-[#224c87]">{formatSIP(currentCell.sip)}</span>
        </div>

        {higherCell && higherCell.return !== currentCell.return && (
          <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-100">
            <span className="text-sm text-green-800">If returns rise to <strong>{higherCell.return}%</strong></span>
            <span className="text-sm font-bold text-green-700">SIP drops to {formatSIP(higherCell.sip)}</span>
          </div>
        )}
      </div>
      
      <p style={{ fontSize: 11, color: '#919090', marginTop: 12 }}>
        * Based on constant inflation of {currentRow.inflation}%.
      </p>
    </div>
  );
}