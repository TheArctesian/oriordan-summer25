import { get } from 'svelte/store';
import { api, type ApiResponse } from '$lib/utils/api';
import {
	events, attendees, accommodations, eventAttendance,
	eventsLoading, attendeesLoading, accommodationsLoading, eventAttendanceLoading,
	eventsError, attendeesError, accommodationsError, eventAttendanceError
} from '$lib/stores/admin';
import type { Event, Attendee, Accommodation, EventAttendance } from '$lib/types';

// Events service
export const eventsService = {
	async loadAll() {
		eventsLoading.set(true);
		eventsError.set(null);
		
		const response = await api.get<Event>('/api/admin/events');
		
		if (response.success && response.data) {
			events.set(response.data);
		} else {
			eventsError.set(response.error || 'Failed to load events');
		}
		
		eventsLoading.set(false);
		return response;
	},

	async create(eventData: Partial<Event>) {
		const response = await api.create<Event>('/api/admin/events', eventData);
		
		if (response.success) {
			// Refresh the list
			this.loadAll();
		}
		
		return response;
	},

	async update(id: number, eventData: Partial<Event>) {
		const response = await api.update<Event>('/api/admin/events', id, eventData);
		
		if (response.success) {
			// Update the store
			const currentEvents = get(events);
			events.set(currentEvents.map(e => e.id === id ? { ...e, ...eventData } : e));
		}
		
		return response;
	},

	async delete(id: number) {
		const response = await api.delete('/api/admin/events', id);
		
		if (response.success) {
			// Remove from store
			const currentEvents = get(events);
			events.set(currentEvents.filter(e => e.id !== id));
		}
		
		return response;
	}
};

// Attendees service
export const attendeesService = {
	async loadAll() {
		attendeesLoading.set(true);
		attendeesError.set(null);
		
		const response = await api.get<Attendee>('/api/admin/attendees');
		
		if (response.success && response.data) {
			attendees.set(response.data);
		} else {
			attendeesError.set(response.error || 'Failed to load attendees');
		}
		
		attendeesLoading.set(false);
		return response;
	},

	async create(attendeeData: Partial<Attendee>) {
		const response = await api.create<Attendee>('/api/admin/attendees', attendeeData);
		
		if (response.success) {
			this.loadAll();
		}
		
		return response;
	},

	async update(id: number, attendeeData: Partial<Attendee>) {
		const response = await api.update<Attendee>('/api/admin/attendees', id, attendeeData);
		
		if (response.success) {
			const currentAttendees = get(attendees);
			attendees.set(currentAttendees.map(a => a.id === id ? { ...a, ...attendeeData } : a));
		}
		
		return response;
	},

	async delete(id: number) {
		const response = await api.delete('/api/admin/attendees', id);
		
		if (response.success) {
			const currentAttendees = get(attendees);
			attendees.set(currentAttendees.filter(a => a.id !== id));
		}
		
		return response;
	}
};

// Accommodations service
export const accommodationsService = {
	async loadAll() {
		accommodationsLoading.set(true);
		accommodationsError.set(null);
		
		const response = await api.get<Accommodation>('/api/admin/accommodations');
		
		if (response.success && response.data) {
			accommodations.set(response.data);
		} else {
			accommodationsError.set(response.error || 'Failed to load accommodations');
		}
		
		accommodationsLoading.set(false);
		return response;
	},

	async create(accommodationData: Partial<Accommodation>) {
		const response = await api.create<Accommodation>('/api/admin/accommodations', accommodationData);
		
		if (response.success) {
			this.loadAll();
		}
		
		return response;
	},

	async update(id: number, accommodationData: Partial<Accommodation>) {
		const response = await api.update<Accommodation>('/api/admin/accommodations', id, accommodationData);
		
		if (response.success) {
			const currentAccommodations = get(accommodations);
			accommodations.set(currentAccommodations.map(a => a.id === id ? { ...a, ...accommodationData } : a));
		}
		
		return response;
	},

	async delete(id: number) {
		const response = await api.delete('/api/admin/accommodations', id);
		
		if (response.success) {
			const currentAccommodations = get(accommodations);
			accommodations.set(currentAccommodations.filter(a => a.id !== id));
		}
		
		return response;
	}
};

// Event Attendance service
export const eventAttendanceService = {
	async loadAll() {
		eventAttendanceLoading.set(true);
		eventAttendanceError.set(null);
		
		const response = await api.get<EventAttendance>('/api/admin/event-attendance');
		
		if (response.success && response.data) {
			eventAttendance.set(response.data);
		} else {
			eventAttendanceError.set(response.error || 'Failed to load event attendance');
		}
		
		eventAttendanceLoading.set(false);
		return response;
	},

	async create(attendanceData: Partial<EventAttendance>) {
		const response = await api.create<EventAttendance>('/api/admin/event-attendance', attendanceData);
		
		if (response.success) {
			this.loadAll();
		}
		
		return response;
	},

	async update(eventId: number, attendeeId: number, status: string) {
		const response = await api.update<EventAttendance>('/api/admin/event-attendance', 0, {
			event_id: eventId,
			attendee_id: attendeeId,
			status
		});
		
		if (response.success) {
			const current = get(eventAttendance);
			eventAttendance.set(current.map(ea => 
				ea.event_id === eventId && ea.attendee_id === attendeeId 
					? { ...ea, status }
					: ea
			));
		}
		
		return response;
	},

	async delete(eventId: number, attendeeId: number) {
		const response = await api.delete('/api/admin/event-attendance', 0);
		
		if (response.success) {
			const current = get(eventAttendance);
			eventAttendance.set(current.filter(ea => 
				!(ea.event_id === eventId && ea.attendee_id === attendeeId)
			));
		}
		
		return response;
	}
};