import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { addCompletion, getChore } from '@/lib/db/queries';
import { canCompleteChores } from '@/lib/permissions';
import { requireMembership } from '@/lib/session';

const schema = z.object({
  note: z.string().trim().max(280).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const chore = getChore(db(), id);
  if (!chore || chore.archived) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const ctx = await requireMembership(chore.household_id);
  if (!ctx || !canCompleteChores(ctx.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = schema.safeParse(await req.json().catch(() => ({})));
  const note = body.success ? body.data.note : undefined;

  addCompletion(db(), id, ctx.user.id, note);
  return NextResponse.json({ ok: true }, { status: 201 });
}
