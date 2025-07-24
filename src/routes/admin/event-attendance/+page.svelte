<script lang="ts">
  import { onMount } from 'svelte';

  let eventAttendance = [];
  let events = [];
  let attendees = [];
  let loading = true;
  let selectedEvent = '';

  onMount(async () => {
    try {
      const [attendanceResponse, eventsResponse, attendeesResponse] = await Promise.all([
        fetch('/api/admin/event-attendance').then(r => r.json()),
        fetch('/api/admin/events').then(r => r.json()),
        fetch('/api/admin/attendees').then(r => r.json())
      ]);
      
      eventAttendance = attendanceResponse;
      events = eventsResponse;
      attendees = attendeesResponse;
      loading = false;
    } catch (error) {
      console.error('Failed to load data', error);
      loading = false;
    }
  });

  $: filteredAttendance = selectedEvent 
    ? eventAttendance.filter(ea => ea.eventId === parseInt(selectedEvent))
    : eventAttendance;

  function getAttendeeName(attendeeId) {
    const attendee = attendees.find(a => a.id === attendeeId);
    return attendee ? `${attendee.firstName} ${attendee.lastName}` : 'Unknown';
  }

  function getEventTitle(eventId) {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  }
</script>

<div>
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <h1 class="text-irish-navy text-3xl font-bold">Event Attendance</h1>
    
    <div class="flex flex-col sm:flex-row gap-3">
      <select 
        bind:value={selectedEvent} 
        class="border border-irish-stone rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
      >
        <option value="">All Events</option>
        {#each events as event}
          <option value={event.id}>{event.title} ({new Date(event.date).toLocaleDateString()})</option>
        {/each}
      </select>

      <a
        href="/admin/event-attendance/manage"
        class="bg-irish-green hover:bg-irish-green-dark rounded px-4 py-2 text-white transition-colors whitespace-nowrap"
      >
        Manage Attendance
      </a>
    </div>
  </div>

  {#if loading}
    <div class="py-8 text-center">
      <p class="text-irish-navy-light">Loading attendance data...</p>
    </div>
  {:else if eventAttendance.length === 0}
    <div class="bg-irish-stone-light rounded-lg py-8 text-center">
      <p class="text-irish-navy">No event attendance records found.</p>
      <a
        href="/admin/event-attendance/manage"
        class="bg-irish-green hover:bg-irish-green-dark mt-4 inline-block rounded px-4 py-2 text-white transition-colors"
      >
        Manage Event Attendance
      </a>
    </div>
  {:else if filteredAttendance.length === 0}
    <div class="bg-irish-stone-light rounded-lg py-8 text-center">
      <p class="text-irish-navy">No attendance records for this event.</p>
      <button
        on:click={() => selectedEvent = ''}
        class="bg-irish-navy hover:bg-irish-navy-light mt-4 inline-block rounded px-4 py-2 text-white transition-colors"
      >
        View All Events
      </button>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-irish-stone shadow">
      <table class="min-w-full overflow-hidden bg-white">
        <thead class="bg-irish-navy text-white">
          <tr>
            <th class="px-4 py-3 text-left">Event</th>
            <th class="px-4 py-3 text-left">Attendee</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-irish-stone divide-y">
          {#each filteredAttendance as record}
            <tr class="hover:bg-irish-stone-light">
              <td class="px-4 py-3">{getEventTitle(record.eventId)}</td>
              <td class="px-4 py-3">{getAttendeeName(record.attendeeId)}</td>
              <td class="px-4 py-3">
                <span
                  class={`rounded-full px-2 py-1 text-xs ${
                    record.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                    record.status === 'Maybe' ? 'bg-yellow-100 text-yellow-800' : 
                    record.status === 'Declined' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {record.status || 'Unknown'}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex space-x-2">
                  <a
                    href={`/admin/event-attendance/${record.id}/edit`}
                    class="text-irish-navy hover:text-irish-orange">Edit</a
                  >
                  <button class="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="mt-4 text-sm text-gray-600">
      Showing {filteredAttendance.length} of {eventAttendance.length} attendance records
    </div>
  {/if}
</div>
