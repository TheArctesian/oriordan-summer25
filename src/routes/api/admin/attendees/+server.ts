import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendees, accommodations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db
      .select({
        id: attendees.id,
        firstName: attendees.firstName,
        lastName: attendees.lastName,
        email: attendees.email,
        phone: attendees.phone,
        countryId: attendees.countryId,
        isConfirmed: attendees.isConfirmed,
        isAdult: attendees.isAdult,
        accommodationId: attendees.accommodationId,
        accommodationLocation: attendees.accommodationLocation,
        arrivalDate: attendees.arrivalDate,
        departureDate: attendees.departureDate,
        specialRequests: attendees.specialRequests
      })
      .from(attendees)
      .leftJoin(accommodations, eq(attendees.accommodationId, accommodations.id))
      .orderBy(attendees.lastName, attendees.firstName);

    // Add accommodation name to each attendee
    const attendeesWithAccommodation = results.map((row) => {
      return {
        ...row,
        accommodationName: row.accommodations ? row.accommodations.name : null
      };
    });

    return json(attendeesWithAccommodation);
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return json({ error: 'Failed to fetch attendees' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();

    const result = await db.insert(attendees)
      .values(data)
      .returning();

    return json(result[0]);
  } catch (error) {
    console.error('Error creating attendee:', error);
    return json({ error: 'Failed to create attendee' }, { status: 500 });
  }
}

export async function PUT({ request }) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return json({ error: 'Attendee ID is required' }, { status: 400 });
    }

    const result = await db.update(attendees)
      .set(data)
      .where(eq(attendees.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Attendee not found' }, { status: 404 });
    }

    return json(result[0]);
  } catch (error) {
    console.error('Error updating attendee:', error);
    return json({ error: 'Failed to update attendee' }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return json({ error: 'Attendee ID is required' }, { status: 400 });
    }

    const result = await db.delete(attendees)
      .where(eq(attendees.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Attendee not found' }, { status: 404 });
    }

    return json({ message: 'Attendee deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendee:', error);
    return json({ error: 'Failed to delete attendee' }, { status: 500 });
  }
}
