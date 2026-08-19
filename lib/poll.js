// Polls support a variable number of answer choices (2 to MAX_CHOICES).
export const MAX_CHOICES = 8;
export const MIN_CHOICES = 2;

// Choices are stored as a JSON array under the `choices` field on the
// question hash. Older questions (created before this was variable) stored
// up to 4 choices in separate choice1..choice4 fields instead — fall back
// to those so existing polls keep working.
export function parseChoices(q) {
  if (q?.choices) {
    try {
      const arr = JSON.parse(q.choices);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    } catch {
      // fall through to legacy fields
    }
  }

  return [q?.choice1, q?.choice2, q?.choice3, q?.choice4].filter(
    (c) => c !== undefined && c !== ""
  );
}
