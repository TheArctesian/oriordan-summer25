import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';

export async function GET() {
  try {
    // Return all events for public viewing
    const publicEvents = await db
      .select()
      .from(events)
      .orderBy(events.date, events.startTime);

    return json(publicEvents);
  } catch (error) {
    console.error('Error fetching public events:', error);
    return json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}