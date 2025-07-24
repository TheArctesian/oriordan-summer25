import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { gte } from 'drizzle-orm';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allEvents = await db
      .select()
      .from(events)
      .where(gte(events.date, today))
      .orderBy(events.date, events.startTime);

    return json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
