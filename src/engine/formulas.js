export function calcFV(cost, inflation, yrs) {
  const rate = inflation / 100;
  return parseFloat((cost * Math.pow(1 + rate, yrs)).toFixed(10));
}

export function calcSIP(fv, annualRet, yrs) {
  const r = annualRet / 12 / 100;
  const n = yrs * 12;

  if (r === 0) return parseFloat((fv / n).toFixed(2));

  const sip = (fv * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));  
  return parseFloat(sip.toFixed(2));
}

export function calcAll({ cost, inflation, yrs, annualRet, lumpsum = 0 }) {
  const fv = calcFV(cost, inflation, yrs);

  const lumpsumFV = lumpsum > 0
    ? parseFloat((lumpsum * Math.pow(1 + annualRet / 100, yrs)).toFixed(10))
    : 0;

  const effFV = Math.max(0, parseFloat((fv - lumpsumFV).toFixed(10)));

  const sip = effFV > 0 ? calcSIP(effFV, annualRet, yrs) : 0;

  const n = yrs * 12;
  const invested = parseFloat((sip * n + lumpsum).toFixed(2));
  const corpus = parseFloat(fv.toFixed(2));
  const returns = parseFloat((corpus - invested).toFixed(2));

  return {
    fv: corpus,
    sip,
    invested,
    returns,
    corpus,
    lumpsumFV: parseFloat(lumpsumFV.toFixed(2)),
    effFV: parseFloat(effFV.toFixed(2)),
  };
}