import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { findHouseholdByJoinCode, joinHousehold } from '@/lib/db/queries';
import { normalizeJoinCode } from '@/lib/codes';
import { currentUser } from '@/lib/session';

const schema = z.object({
  code: z.string().trim().min(1).max(32),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 });

  const household = findHouseholdByJoinCode(db(), normalizeJoinCode(body.data.code));
  if (!household) return NextResponse.json({ error: 'no household for that code' }, { status: 404 });

  const role = joinHousehold(db(), household.id, user.id);
  return NextResponse.json({ household, role }, { status: 200 });
}
