export function parseGoalResponse(raw) {
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return {
      goalType: parsed.goalType ?? null,
      cost: parsed.cost ? Number(parsed.cost) : null,
      yrs: parsed.yrs ? Number(parsed.yrs) : null,
    };
  } catch {
    return { goalType: null, cost: null, yrs: null };
  }
}

export function parseValidatorResponse(raw) {
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed)
      ? parsed.filter(f => f.flag === true)
      : [];
  } catch {
    return [];
  }
}