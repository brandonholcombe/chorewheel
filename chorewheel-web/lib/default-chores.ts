// Starter chores every new household is seeded with. These are just defaults —
// household admins can edit, archive, or add to them freely afterward.
// cadenceMinutes drives freshness; effortMinutes is the estimated time.
export interface DefaultChore {
  name: string;
  cadenceMinutes: number | null;
  effortMinutes: number;
}

const HOURS = 60;
const DAYS = 1440;

export const DEFAULT_CHORES: DefaultChore[] = [
  { name: 'Feed the dog', cadenceMinutes: 12 * HOURS, effortMinutes: 3 }, // 2× a day
  { name: 'Take the dog out', cadenceMinutes: 6 * HOURS, effortMinutes: 8 }, // 4× a day
  { name: 'Dishes', cadenceMinutes: 1 * DAYS, effortMinutes: 12 },
  { name: 'Take out trash', cadenceMinutes: 3 * DAYS, effortMinutes: 5 },
  { name: 'Water plants', cadenceMinutes: 4 * DAYS, effortMinutes: 5 },
  { name: 'Vacuum', cadenceMinutes: 7 * DAYS, effortMinutes: 25 },
];
