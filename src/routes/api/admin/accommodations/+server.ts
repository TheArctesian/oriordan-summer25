import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { accommodations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allAccommodations = await db.select().from(accommodations).orderBy(accommodations.name);

    return json(allAccommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return json({ error: 'Failed to fetch accommodations' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();

    const result = await db.insert(accommodations)
      .values(data)
      .returning();

    return json(result[0]);
  } catch (error) {
    console.error('Error creating accommodation:', error);
    return json({ error: 'Failed to create accommodation' }, { status: 500 });
  }
}

export async function PUT({ request }) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return json({ error: 'Accommodation ID is required' }, { status: 400 });
    }

    const result = await db.update(accommodations)
      .set(data)
      .where(eq(accommodations.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Accommodation not found' }, { status: 404 });
    }

    return json(result[0]);
  } catch (error) {
    console.error('Error updating accommodation:', error);
    return json({ error: 'Failed to update accommodation' }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const { id } = await request.json();

    if (!id) {
      return json({ error: 'Accommodation ID is required' }, { status: 400 });
    }

    const result = await db.delete(accommodations)
      .where(eq(accommodations.id, id))
      .returning();

    if (result.length === 0) {
      return json({ error: 'Accommodation not found' }, { status: 404 });
    }

    return json({ message: 'Accommodation deleted successfully' });
  } catch (error) {
    console.error('Error deleting accommodation:', error);
    return json({ error: 'Failed to delete accommodation' }, { status: 500 });
  }
}
