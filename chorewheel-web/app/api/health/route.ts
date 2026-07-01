import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

// Liveness/readiness probe. Touches the DB so the pod is only "ready" once
// SQLite is open and migrations have run (client.ts runs them on first open).
export const dynamic = 'force-dynamic';

export function GET() {
  try {
    db().prepare('SELECT 1').get();
    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
