export function extractJSON(raw: string | null): any {
  if (!raw) return null;
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse JSON', e);
    return null;
  }
}

export function extractText(raw: string | null): string {
  if (!raw) return '';
  return raw.replace(/```json/g, '').replace(/```/g, '').trim();
}