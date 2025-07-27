import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendees } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  try {
    const accommodationId = parseInt(params.id);

    if (isNaN(accommodationId)) {
      return json({ error: 'Invalid accommodation ID' }, { status: 400 });
    }

    // Get attendees staying at this accommodation
    const accommodationAttendees = await db
      .select({
        id: attendees.id,
        firstName: attendees.firstName,
        lastName: attendees.lastName,
        countryId: attendees.countryId
      })
      .from(attendees)
      .where(eq(attendees.accommodationId, accommodationId));

    return json(accommodationAttendees);
  } catch (error) {
    console.error('Error fetching accommodation attendees:', error);
    return json({ error: 'Failed to fetch accommodation attendees' }, { status: 500 });
  }
}