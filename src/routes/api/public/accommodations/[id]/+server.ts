import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { accommodations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  try {
    const accommodationId = parseInt(params.id);
    
    if (isNaN(accommodationId)) {
      return json({ error: 'Invalid accommodation ID' }, { status: 400 });
    }

    const accommodation = await db
      .select()
      .from(accommodations)
      .where(eq(accommodations.id, accommodationId))
      .limit(1);

    if (accommodation.length === 0) {
      return json({ error: 'Accommodation not found' }, { status: 404 });
    }

    return json(accommodation[0]);
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    return json({ error: 'Failed to fetch accommodation' }, { status: 500 });
  }
}