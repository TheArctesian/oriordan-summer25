import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eventAttendance, events, attendees } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST({ request }) {
  try {
    const { eventId, attendeeId, status } = await request.json();

    // Validate inputs
    if (!eventId || !attendeeId || !status) {
      return json(
        {
          error: 'Missing required fields',
          received: { eventId, attendeeId, status }
        },
        { status: 400 }
      );
    }

    // Verify event and attendee exist
    const eventExists = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    const attendeeExists = await db
      .select({ id: attendees.id })
      .from(attendees)
      .where(eq(attendees.id, attendeeId))
      .limit(1);

    if (eventExists.length === 0) {
      return json({ error: 'Event not found' }, { status: 404 });
    }

    if (attendeeExists.length === 0) {
      return json({ error: 'Attendee not found' }, { status: 404 });
    }

    // Check if record already exists
    const existingRecord = await db
      .select({ id: eventAttendance.id })
      .from(eventAttendance)
      .where(and(eq(eventAttendance.eventId, eventId), eq(eventAttendance.attendeeId, attendeeId)))
      .limit(1);

    if (existingRecord.length > 0) {
      return json({ error: 'Already registered for this event' }, { status: 409 });
    }

    // Insert new record
    const result = await db
      .insert(eventAttendance)
      .values({
        attendeeId: attendeeId,
        eventId: eventId,
        status: status
      })
      .returning();

    return json(result[0]);
  } catch (error) {
    console.error('Error registering for event:', error);
    return json({ error: 'Failed to register for event' }, { status: 500 });
  }
}