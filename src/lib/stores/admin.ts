import { writable } from 'svelte/store';
import type { Event, Attendee, Accommodation, EventAttendance } from '$lib/types';

// Loading states
export const eventsLoading = writable(false);
export const attendeesLoading = writable(false);
export const accommodationsLoading = writable(false);
export const eventAttendanceLoading = writable(false);

// Data stores
export const events = writable<Event[]>([]);
export const attendees = writable<Attendee[]>([]);
export const accommodations = writable<Accommodation[]>([]);
export const eventAttendance = writable<EventAttendance[]>([]);

// Error states
export const eventsError = writable<string | null>(null);
export const attendeesError = writable<string | null>(null);
export const accommodationsError = writable<string | null>(null);
export const eventAttendanceError = writable<string | null>(null);