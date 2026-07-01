// Starter chores every new household is seeded with. These are just defaults —
// household admins can edit, archive, or add to them freely afterward.
export interface DefaultChore {
  name: string;
  cadenceDays: number | null;
}

export const DEFAULT_CHORES: DefaultChore[] = [
  { name: 'Take out trash', cadenceDays: 3 },
  { name: 'Dishes', cadenceDays: 1 },
  { name: 'Vacuum', cadenceDays: 7 },
  { name: 'Water plants', cadenceDays: 4 },
];
