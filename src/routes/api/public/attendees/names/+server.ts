import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendees } from '$lib/server/db/schema';

export async function GET() {
  try {
    // Get all attendee names for autocomplete suggestions
    const allAttendees = await db
      .select({
        id: attendees.id,
        firstName: attendees.firstName,
        lastName: attendees.lastName
      })
      .from(attendees)
      .orderBy(attendees.firstName, attendees.lastName);

    // Create an array of full names
    const names = allAttendees.map(attendee => ({
      id: attendee.id,
      fullName: `${attendee.firstName} ${attendee.lastName}`,
      firstName: attendee.firstName,
      lastName: attendee.lastName
    }));

    return json({ names });
  } catch (error) {
    console.error('Error fetching attendee names:', error);
    return json({ error: 'Failed to fetch attendee names' }, { status: 500 });
  }
}