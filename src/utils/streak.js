// Streak math shared by the Home widget, the Profile heat map, and DataContext.
//
// A "streak" is the number of consecutive calendar days (local time) on which
// the user watched at least one reel, ending today — or yesterday, so the streak
// stays "alive" until the day is actually missed.

// Local 'YYYY-MM-DD' key for a Date (avoids the UTC shift of toISOString).
export const dayKey = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Current streak from a collection of active-day keys ('YYYY-MM-DD').
 * @param dayKeys  Set or array of local day keys with at least one view.
 * @param today    Reference "now" (defaults to the current date).
 */
export const computeCurrentStreak = (dayKeys, today = new Date()) => {
  const active = dayKeys instanceof Set ? dayKeys : new Set(dayKeys);
  if (active.size === 0) return 0;

  const cursor = new Date(today);
  // No view yet today? The streak is still alive only if yesterday was active.
  if (!active.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!active.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (active.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1); // setDate handles month/DST rollover
  }
  return streak;
};

/** Longest run of consecutive active days anywhere in the set. */
export const computeLongestStreak = (dayKeys) => {
  const keys = [...(dayKeys instanceof Set ? dayKeys : new Set(dayKeys))].sort();
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const key of keys) {
    const d = new Date(key);
    if (prev) {
      const expected = new Date(prev);
      expected.setDate(expected.getDate() + 1);
      run = dayKey(expected) === key ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = d;
  }
  return longest;
};
