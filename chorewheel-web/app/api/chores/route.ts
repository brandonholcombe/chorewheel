import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { createChore } from '@/lib/db/queries';
import { canManageChores } from '@/lib/permissions';
import { requireMembership } from '@/lib/session';

const schema = z.object({
  householdId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  cadenceDays: z.number().int().positive().max(365).nullable().optional(),
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 });

  const ctx = await requireMembership(body.data.householdId);
  if (!ctx) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!canManageChores(ctx.role)) {
    return NextResponse.json({ error: 'admin only' }, { status: 403 });
  }

  const chore = createChore(db(), {
    householdId: body.data.householdId,
    name: body.data.name,
    description: body.data.description ?? null,
    cadenceDays: body.data.cadenceDays ?? null,
    createdBy: ctx.user.id,
  });
  return NextResponse.json({ chore }, { status: 201 });
}
