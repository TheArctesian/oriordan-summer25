import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';

export async function GET() {
  try {
    const allEvents = await db.select().from(events).orderBy(events.date, events.startTime);

    return json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
