import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { getChore, updateChore } from '@/lib/db/queries';
import { canManageChores } from '@/lib/permissions';
import { requireMembership } from '@/lib/session';

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  cadenceDays: z.number().int().positive().max(365).nullable().optional(),
  archived: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

async function adminForChore(choreId: string) {
  const chore = getChore(db(), choreId);
  if (!chore) return { error: NextResponse.json({ error: 'not found' }, { status: 404 }) };
  const ctx = await requireMembership(chore.household_id);
  if (!ctx || !canManageChores(ctx.role)) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  return { chore };
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = patchSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 });

  const guard = await adminForChore(id);
  if (guard.error) return guard.error;

  updateChore(db(), id, body.data);
  return NextResponse.json({ chore: getChore(db(), id) });
}

// Archive (soft delete) — keeps completion history intact.
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const guard = await adminForChore(id);
  if (guard.error) return guard.error;

  updateChore(db(), id, { archived: true });
  return NextResponse.json({ ok: true });
}
