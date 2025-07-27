import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eventAttendance, attendees } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  try {
    const eventId = parseInt(params.id);

    if (isNaN(eventId)) {
      return json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Join eventAttendance with attendees to get full details
    const attendeesList = await db
      .select({
        id: attendees.id,
        firstName: attendees.firstName,
        lastName: attendees.lastName,
        countryId: attendees.countryId,
        status: eventAttendance.status
      })
      .from(eventAttendance)
      .innerJoin(attendees, eq(eventAttendance.attendeeId, attendees.id))
      .where(eq(eventAttendance.eventId, eventId));

    return json(attendeesList);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return json({ error: 'Failed to fetch event attendees' }, { status: 500 });
  }
}