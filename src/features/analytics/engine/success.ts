export function calculateSuccessProbability(rollingReturns: number[], targetAmount: number, initialCapital: number, years: number): number {
  if (rollingReturns.length === 0) return 0;
  
  // Future Value = P(1+r)^t
  // Find minimum required CAGR to hit target
  const requiredAbsolute = targetAmount / initialCapital;
  const requiredCagr = (Math.pow(requiredAbsolute, 1 / years) - 1) * 100;

  // How many historical rolling periods beat this required CAGR?
  const successes = rollingReturns.filter(r => r >= requiredCagr).length;
  
  return Math.round((successes / rollingReturns.length) * 100);
}
