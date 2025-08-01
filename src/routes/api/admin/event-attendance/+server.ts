import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eventAttendance, events, attendees } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const allEventAttendance = await db.select().from(eventAttendance);

    return json(allEventAttendance);
  } catch (error) {
    console.error('Error fetching event attendance:', error);
    return json({ error: 'Failed to fetch event attendance' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { eventId, attendeeId, status } = await request.json();

    // Validate inputs
    if ((!eventId && eventId != 0) || !attendeeId || !status) {
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
      return json({ error: 'Attendance record already exists' }, { status: 409 });
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
    console.error('Error adding event attendance:', error);
    return json({ error: 'Failed to add event attendance' }, { status: 500 });
  }
}

export async function PUT({ request }) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return json({ error: 'Event attendance ID is required' }, { status: 400 });
    }

    const result = await db
      .update(eventAttendance)
      .set(data)
      .where(eq(eventAttendance.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Event attendance record not found' }, { status: 404 });
    }

    return json(result[0]);
  } catch (error) {
    console.error('Error updating event attendance:', error);
    return json({ error: 'Failed to update event attendance' }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    console.log('🗑️ DELETE endpoint called');
    const body = await request.json();
    console.log('🗑️ Request body:', body);
    
    const { id } = body;
    console.log('🗑️ Extracted ID:', id, 'type:', typeof id);

    if (!id) {
      console.log('🗑️ No ID provided');
      return json({ error: 'Event attendance ID is required' }, { status: 400 });
    }

    console.log('🗑️ Attempting to delete record with ID:', id);
    const result = await db.delete(eventAttendance).where(eq(eventAttendance.id, id)).returning();
    console.log('🗑️ Delete result:', result);

    if (result.length === 0) {
      console.log('🗑️ No record found with ID:', id);
      return json({ error: 'Event attendance record not found' }, { status: 404 });
    }

    console.log('🗑️ Successfully deleted record');
    return json({ message: 'Event attendance deleted successfully', deletedRecord: result[0] });
  } catch (error) {
    console.error('🗑️ Error deleting event attendance:', error);
    return json({ error: 'Failed to delete event attendance' }, { status: 500 });
  }
}
