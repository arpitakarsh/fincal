import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { COLORS } from '@/lib/constants';

export default function TimelineVisual({ yearByYearData, title = "Goal Achievement Timeline" }) {
  if (!yearByYearData || yearByYearData.length === 0) return null;

  const totalYears = yearByYearData.length;
  
  // Select which milestones to show based on length
  let milestones = [];
  if (totalYears <= 3) {
    milestones = yearByYearData.map((d, i) => i + 1); // show all
  } else if (totalYears <= 5) {
    milestones = [1, Math.floor(totalYears / 2), totalYears];
  } else if (totalYears <= 15) {
    milestones = [1, 3, Math.floor(totalYears / 2), totalYears];
  } else {
    milestones = [1, 5, Math.floor(totalYears / 2), totalYears];
  }

  // Deduplicate and sort
  milestones = [...new Set(milestones)].sort((a, b) => a - b);

  const formatLakh = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="mb-4 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: COLORS.border }}>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">⏳</span>
        <h3 className="text-sm font-semibold tracking-wide uppercase text-[#1a1a2e]">
          {title}
        </h3>
      </div>
      
      <div className="relative pl-4 sm:pl-8">
        {/* Vertical line connecting the dots */}
        <div className="absolute left-[20px] sm:left-[36px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
        
        <div className="flex flex-col gap-6">
          {milestones.map((year, index) => {
            const dataPoint = yearByYearData[year - 1]; // Array is 0-indexed
            if (!dataPoint) return null;

            const isLast = index === milestones.length - 1;
            const corpus = Math.round(dataPoint.corpusValue);

            return (
              <motion.div 
                key={year}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative flex items-center gap-4 sm:gap-6"
              >
                {/* The Dot */}
                <div 
                  className={`relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-white ${isLast ? 'border-green-500 h-5 w-5' : 'border-[#224c87]'}`}
                >
                  {isLast && <div className="h-2 w-2 rounded-full bg-green-500" />}
                </div>

                {/* The Content */}
                <div className="flex flex-1 flex-col sm:flex-row sm:items-baseline sm:justify-between py-1 border-b border-gray-50 border-dashed pb-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {isLast ? 'Goal Reached' : `Year ${year}`}
                    </span>
                    <div className={`mt-0.5 font-montserrat text-lg sm:text-2xl font-bold ${isLast ? 'text-green-600' : 'text-[#1a1a2e]'}`}>
                      <CountUp end={corpus} duration={2} separator="," decimals={0} prefix="₹" />
                    </div>
                  </div>
                  
                  {isLast && (
                    <div className="mt-1 sm:mt-0 text-[10px] sm:text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                      🎉 Goal Achieved
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
