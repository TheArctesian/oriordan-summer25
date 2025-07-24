import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { gte } from 'drizzle-orm';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = await db.select()
      .from(events)
      .where(gte(events.date, today))
      .orderBy(events.date, events.startTime)
      .limit(6);

    return json(upcomingEvents);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return json({ error: 'Failed to fetch upcoming events' }, { status: 500 });
  }
}
