import React from 'react';
import { RankedFund } from '../engine';
import { compareTwoFunds } from '../engine/comparison';

interface Props {
  fundA: RankedFund;
  fundB: RankedFund;
}

export function ComparisonTable({ fundA, fundB }: Props) {
  const diffs = compareTwoFunds(fundA, fundB);

  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-4 py-3">Metric</th>
            <th className="px-4 py-3">{fundA.name}</th>
            <th className="px-4 py-3">{fundB.name}</th>
          </tr>
        </thead>
        <tbody>
          {diffs.map((diff, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-3 font-medium">{diff.metric}</td>
              <td className={`px-4 py-3 ${diff.winner === 'A' ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                {diff.fundAValue}
              </td>
              <td className={`px-4 py-3 ${diff.winner === 'B' ? 'bg-green-50 text-green-700 font-bold' : ''}`}>
                {diff.fundBValue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
