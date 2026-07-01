'use client';

import { useState } from 'react';

// Shared cadence (value + unit) and effort inputs used by both the add and edit
// chore forms. Cadence is stored as minutes; the UI lets you pick hours or days
// so sub-daily chores ("feed the dog", every 12h) are easy to express.

export type CadenceUnit = 'hours' | 'days';
const UNIT_MINUTES: Record<CadenceUnit, number> = { hours: 60, days: 1440 };

export interface CadenceState {
  value: string; // may be '' for "no schedule"
  unit: CadenceUnit;
}

/** Convert a stored cadence (minutes) into a friendly {value, unit} for editing. */
export function cadenceToState(minutes: number | null | undefined): CadenceState {
  if (!minutes) return { value: '', unit: 'days' };
  if (minutes % 1440 === 0) return { value: String(minutes / 1440), unit: 'days' };
  if (minutes % 60 === 0) return { value: String(minutes / 60), unit: 'hours' };
  // Fall back to hours with one decimal.
  return { value: String(+(minutes / 60).toFixed(2)), unit: 'hours' };
}

/** null when no value (untimed chore). */
export function cadenceToMinutes(state: CadenceState): number | null {
  const n = Number(state.value);
  if (!state.value || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * UNIT_MINUTES[state.unit]);
}

export function CadenceInput({
  state,
  onChange,
}: {
  state: CadenceState;
  onChange: (s: CadenceState) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow">Repeat every</span>
      <div className="flex gap-2">
        <input
          value={state.value}
          onChange={(e) => onChange({ ...state, value: e.target.value.replace(/[^0-9.]/g, '') })}
          placeholder="—"
          inputMode="decimal"
          className="input-geo w-20 text-center"
        />
        <select
          value={state.unit}
          onChange={(e) => onChange({ ...state, unit: e.target.value as CadenceUnit })}
          className="input-geo flex-1"
        >
          <option value="hours">hours</option>
          <option value="days">days</option>
        </select>
      </div>
    </label>
  );
}

export function EffortInput({
  minutes,
  onChange,
}: {
  minutes: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow">Effort (min)</span>
      <input
        value={minutes}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder="5"
        inputMode="numeric"
        className="input-geo w-24 text-center"
      />
    </label>
  );
}

// Small hook to manage the shared add/edit form state.
export function useChoreForm(initial: {
  name?: string;
  cadenceMinutes?: number | null;
  effortMinutes?: number;
}) {
  const [name, setName] = useState(initial.name ?? '');
  const [cadence, setCadence] = useState<CadenceState>(cadenceToState(initial.cadenceMinutes));
  const [effort, setEffort] = useState(String(initial.effortMinutes ?? 5));
  return { name, setName, cadence, setCadence, effort, setEffort };
}
