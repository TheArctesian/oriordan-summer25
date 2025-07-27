import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendees, eventAttendance, events } from '$lib/server/db/schema';
import { eq, and, like, or } from 'drizzle-orm';

export async function GET({ url }) {
  try {
    const name = url.searchParams.get('name');
    
    if (!name || name.trim().length < 2) {
      return json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }

    const searchTerm = name.trim().toLowerCase();

    // Find attendees matching the name
    const matchingAttendees = await db
      .select({
        id: attendees.id,
        firstName: attendees.firstName,
        lastName: attendees.lastName,
        email: attendees.email
      })
      .from(attendees)
      .where(
        or(
          like(attendees.firstName, `%${searchTerm}%`),
          like(attendees.lastName, `%${searchTerm}%`)
        )
      )
      .limit(10); // Limit results to prevent too many matches

    if (matchingAttendees.length === 0) {
      return json({ attendees: [], message: 'No attendees found with that name' });
    }

    // For each attendee, get their event registrations
    const attendeesWithEvents = await Promise.all(
      matchingAttendees.map(async (attendee) => {
        const userEvents = await db
          .select({
            eventId: events.id,
            eventTitle: events.title,
            eventDate: events.date,
            eventStartTime: events.startTime,
            eventEndTime: events.endTime,
            eventLocation: events.location,
            status: eventAttendance.status
          })
          .from(eventAttendance)
          .innerJoin(events, eq(eventAttendance.eventId, events.id))
          .where(eq(eventAttendance.attendeeId, attendee.id));

        return {
          ...attendee,
          events: userEvents
        };
      })
    );

    return json({ attendees: attendeesWithEvents });
  } catch (error) {
    console.error('Error searching attendees:', error);
    return json({ error: 'Failed to search attendees' }, { status: 500 });
  }
}