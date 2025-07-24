import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { accommodations } from '$lib/server/db/schema';

export async function GET() {
  try {
    const allAccommodations = await db.select().from(accommodations).orderBy(accommodations.name);

    return json(allAccommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    return json({ error: 'Failed to fetch accommodations' }, { status: 500 });
  }
}
