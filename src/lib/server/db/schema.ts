import { pgTable, serial, text, integer, boolean, date } from 'drizzle-orm/pg-core';

export const attendees = pgTable('attendees', {
  id: serial('id').primaryKey(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  partner: integer('partner'),
  email: text('email'),
  phone: text('phone'),
  countryId: text('country_id'),
  isConfirmed: boolean('is_confirmed'),
  isAdult: boolean('is_adult'),
  accommodationId: integer('accommodation_id'),
  arrivalDate: date('arrival_date'),
  departureDate: date('departure_date'),
  specialRequests: text('special_requests')
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  date: date('date'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  title: text('title'),
  description: text('description'),
  location: text('location'),
  maxAttendees: text('max_attendees'),
  status: text('status'),
  responsiblePerson: text('responsible_person'),
  contactDetails: text('contact_details'),
  websiteUrl: text('website_url'),
  imageUrl: text('image_url'),
  price: text('price'),
  notes: text('notes')
});

export const eventAttendance = pgTable('event_attendance', {
  id: serial('id').primaryKey(),
  attendeeId: integer('attendee_id'),
  eventId: integer('event_id'),
  status: text('status')
});

export const accommodations = pgTable('accommodations', {
  id: serial('id').primaryKey(),
  name: text('name'),
  address: text('address'),
  capacity: text('capacity'),
  notes: text('notes')
});
