import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  try {
    const eventId = parseInt(params.id);
    
    if (isNaN(eventId)) {
      return json({ error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return json({ error: 'Event not found' }, { status: 404 });
    }

    return json(event[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    return json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}
