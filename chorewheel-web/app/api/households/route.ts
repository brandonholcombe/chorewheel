import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { createHousehold } from '@/lib/db/queries';
import { currentUser } from '@/lib/session';

const schema = z.object({
  name: z.string().trim().min(1).max(80),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 });

  const household = createHousehold(db(), body.data.name, user.id);
  return NextResponse.json({ household }, { status: 201 });
}
