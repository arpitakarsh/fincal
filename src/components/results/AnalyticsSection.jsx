'use client';

import AreaChart from '../charts/AreaChart';
import GlidePath from '../charts/GlidePath';
import StackedBarChart from '../charts/StackedBarChart';
import DonutChart from '../charts/DonutChart';

export default function AnalyticsSection({
  scenarios,
  yrs,
  riskProfile,
  sensitivity,
  inflation,
  annualRet,
  yearByYear,
  results,
}) {
  return (
    <div className="mt-4 mb-6 flex flex-col gap-4">
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>See how your money can grow over time</h2>
        <p style={{ fontSize: 13, color: '#919090', marginBottom: 16 }}>Dive deeper into how your money accumulates and test market scenarios.</p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>Wealth Growth Over Time</p>
        <p style={{ fontSize: 12, color: '#919090', marginBottom: 16 }}>Projected corpus across conservative, moderate, and aggressive scenarios.</p>
        <div style={{ height: 280 }}>
          <AreaChart scenarios={scenarios} yrs={yrs} activeProfile={riskProfile} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>Corpus Breakdown</p>
        <p style={{ fontSize: 12, color: '#919090', marginBottom: 16 }}>Year-by-year invested amount vs returns earned.</p>
        <div style={{ height: 240 }} className="w-full relative">
          <div className="absolute inset-0">
            <StackedBarChart yearByYearData={yearByYear} />
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>Asset Allocation</p>
        <p style={{ fontSize: 12, color: '#919090', marginBottom: 16 }}>Recommended equity-debt split as you approach your goal.</p>
        <div style={{ height: 220 }} className="w-full relative">
          <div className="absolute inset-0">
            <GlidePath years={yrs} />
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e6ed', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4 }}>Investment Summary</p>
        <p style={{ fontSize: 12, color: '#919090', marginBottom: 16 }}>How your total corpus splits between invested amount and returns.</p>
        <div style={{ height: 240 }} className="w-full flex items-center justify-center">
          <DonutChart totalInvested={results?.invested || 0} totalReturns={results?.returns || 0} />
        </div>
      </div>
    </div>
  );
}
