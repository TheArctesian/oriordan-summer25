import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allEvents = await db.select().from(events).orderBy(events.date, events.startTime);

    return json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();

    const result = await db.insert(events)
      .values(data)
      .returning();

    return json(result[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    return json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT({ request }) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return json({ error: 'Event ID is required' }, { status: 400 });
    }

    const result = await db.update(events)
      .set(data)
      .where(eq(events.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Event not found' }, { status: 404 });
    }

    return json(result[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    return json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return json({ error: 'Event ID is required' }, { status: 400 });
    }

    const result = await db.delete(events)
      .where(eq(events.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Event not found' }, { status: 404 });
    }

    return json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
