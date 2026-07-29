/**
 * Calculates rolling returns from an array of daily NAV prices.
 * Assuming data is sorted chronologically ascending.
 */
export interface NAVPoint {
  date: Date;
  value: number;
}

export function calculateRollingReturns(navs: NAVPoint[], windowYears: number): number[] {
  const returns: number[] = [];
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const windowMs = windowYears * msPerYear;

  for (let i = 0; i < navs.length; i++) {
    const startPoint = navs[i];
    
    // Find the end point that is exactly windowYears ahead
    // In a real DB we'd use SQL, but this is the pure logic version
    const targetDateMs = startPoint.date.getTime() + windowMs;
    
    // Quick binary search or linear scan for the closest date
    let endIndex = i;
    while (endIndex < navs.length && navs[endIndex].date.getTime() < targetDateMs) {
      endIndex++;
    }

    if (endIndex < navs.length) {
      const endPoint = navs[endIndex];
      // CAGR Formula: (End/Start)^(1/Years) - 1
      const absoluteReturn = endPoint.value / startPoint.value;
      const cagr = (Math.pow(absoluteReturn, 1 / windowYears) - 1) * 100;
      returns.push(cagr);
    }
  }

  return returns;
}
