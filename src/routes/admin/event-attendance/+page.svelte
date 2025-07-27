<script lang="ts">
  import { onMount } from 'svelte';

  let eventAttendance = [];
  let events = [];
  let attendees = [];
  let loading = true;
  let selectedEvent = '';
  let expandedEvents = new Set();
  let deleting = null;

  onMount(async () => {
    try {
      const [attendanceResponse, eventsResponse, attendeesResponse] = await Promise.all([
        fetch('/api/admin/event-attendance').then(r => r.json()),
        fetch('/api/admin/events').then(r => r.json()),
        fetch('/api/admin/attendees').then(r => r.json())
      ]);
      
      eventAttendance = attendanceResponse;
      events = eventsResponse.sort((a, b) => new Date(a.date) - new Date(b.date));
      attendees = attendeesResponse;
      
      // Debug logging
      console.log('Event attendance loaded:', attendanceResponse.length, 'records');
      console.log('Sample attendance record:', attendanceResponse[0]);
      console.log('Events loaded:', eventsResponse.length);
      console.log('Attendees loaded:', attendeesResponse.length);
      
      loading = false;
    } catch (error) {
      console.error('Failed to load data', error);
      loading = false;
    }
  });

  $: eventsToShow = selectedEvent 
    ? events.filter(e => e.id === parseInt(selectedEvent))
    : events;

  function getAttendeesForEvent(eventId) {
    return eventAttendance
      .filter(record => {
        // Handle both camelCase and snake_case field names
        const recordEventId = record.eventId || record.event_id;
        return recordEventId === eventId;
      })
      .map(record => {
        // Handle both camelCase and snake_case field names
        const recordAttendeeId = record.attendeeId || record.attendee_id;
        const attendee = attendees.find(a => a.id === recordAttendeeId);
        return {
          ...record,
          attendeeName: attendee ? `${attendee.firstName} ${attendee.lastName}` : 'Unknown',
          email: attendee?.email,
          countryId: attendee?.countryId
        };
      })
      .sort((a, b) => a.attendeeName.localeCompare(b.attendeeName));
  }

  function exportEventList(event) {
    const attendeesForEvent = getAttendeesForEvent(event.id);
    
    if (attendeesForEvent.length === 0) {
      alert('No attendees to export for this event.');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Country', 'Status'];
    const csvContent = [
      headers.join(','),
      ...attendeesForEvent.map(record => [
        `"${record.attendeeName}"`,
        `"${record.email || ''}"`,
        `"${record.countryId || ''}"`,
        `"${record.status}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function toggleEvent(eventId) {
    if (expandedEvents.has(eventId)) {
      expandedEvents.delete(eventId);
    } else {
      expandedEvents.add(eventId);
    }
    expandedEvents = new Set(expandedEvents); // Force reactivity
  }

  async function removeAttendance(attendanceId) {
    if (!confirm('Are you sure you want to remove this attendance record?')) {
      return;
    }

    deleting = attendanceId;

    try {
      const response = await fetch('/api/admin/event-attendance', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: attendanceId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove attendance');
      }

      eventAttendance = eventAttendance.filter(ea => ea.id !== attendanceId);
    } catch (error) {
      console.error('Error removing attendance:', error);
      alert('Failed to remove attendance: ' + error.message);
    } finally {
      deleting = null;
    }
  }

  async function updateStatus(attendanceId, newStatus) {
    try {
      const response = await fetch('/api/admin/event-attendance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: attendanceId, status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const updatedRecord = await response.json();
      
      // Update the local state
      eventAttendance = eventAttendance.map(ea => 
        ea.id === attendanceId ? { ...ea, status: newStatus } : ea
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
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
  {:else if events.length === 0}
    <div class="bg-irish-stone-light rounded-lg py-8 text-center">
      <p class="text-irish-navy">No events found.</p>
      <a
        href="/admin/events/new"
        class="bg-irish-orange hover:bg-irish-orange-dark mt-4 inline-block rounded px-4 py-2 text-white transition-colors"
      >
        Create Your First Event
      </a>
    </div>
  {:else if eventsToShow.length === 0}
    <div class="bg-irish-stone-light rounded-lg py-8 text-center">
      <p class="text-irish-navy">No matching events found.</p>
      <button
        on:click={() => selectedEvent = ''}
        class="bg-irish-navy hover:bg-irish-navy-light mt-4 inline-block rounded px-4 py-2 text-white transition-colors"
      >
        View All Events
      </button>
    </div>
  {:else}
    <div class="space-y-6">
      {#each eventsToShow as event}
        {@const attendeesForEvent = getAttendeesForEvent(event.id)}
        {@const isExpanded = expandedEvents.has(event.id)}
        
        <div class="bg-white rounded-lg border border-irish-stone overflow-hidden shadow">
          <!-- Event Header -->
          <div 
            class="bg-irish-navy text-white p-4 flex justify-between items-center cursor-pointer"
            on:click={() => toggleEvent(event.id)}
            on:keydown={(e) => e.key === 'Enter' && toggleEvent(event.id)}
            tabindex="0"
            role="button"
            aria-expanded={isExpanded}
          >
            <div>
              <h3 class="text-xl font-bold">{event.title}</h3>
              <p class="text-sm opacity-80">
                {new Date(event.date).toLocaleDateString()} | {event.startTime} - {event.endTime} | {event.location}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <span class="bg-white text-irish-navy rounded-full px-3 py-1 text-sm font-bold">
                {attendeesForEvent.length} Attendees
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-6 w-6 transform transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <!-- Attendees List -->
          {#if isExpanded}
            <div class="p-4">
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold text-irish-navy">Attendees</h4>
                <div class="flex gap-2">
                  <a 
                    href={`/admin/event-attendance/${event.id}/add`}
                    class="bg-irish-green hover:bg-irish-green-dark text-white px-3 py-1 rounded text-sm"
                  >
                    Add Attendee
                  </a>
                  <button 
                    on:click={() => exportEventList(event)}
                    class="bg-irish-orange hover:bg-irish-orange-dark text-white px-3 py-1 rounded text-sm"
                  >
                    Export List
                  </button>
                </div>
              </div>
              
              {#if attendeesForEvent.length === 0}
                <div class="bg-irish-stone-light rounded p-4 text-center">
                  <p class="text-irish-navy">No attendees registered for this event yet.</p>
                </div>
              {:else}
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-irish-stone">
                    <thead>
                      <tr>
                        <th class="px-4 py-2 text-left text-irish-navy">Name</th>
                        <th class="px-4 py-2 text-left text-irish-navy">Email</th>
                        <th class="px-4 py-2 text-left text-irish-navy">Country</th>
                        <th class="px-4 py-2 text-left text-irish-navy">Status</th>
                        <th class="px-4 py-2 text-left text-irish-navy">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-irish-stone">
                      {#each attendeesForEvent as record}
                        <tr class="hover:bg-irish-stone-light">
                          <td class="px-4 py-2">{record.attendeeName}</td>
                          <td class="px-4 py-2">{record.email || '-'}</td>
                          <td class="px-4 py-2">{record.countryId || '-'}</td>
                          <td class="px-4 py-2">
                            <select
                              value={record.status}
                              on:change={(e) => updateStatus(record.id, e.target.value)}
                              class="rounded border border-gray-300 px-2 py-1 text-xs focus:border-irish-green focus:outline-none"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Maybe">Maybe</option>
                              <option value="Declined">Declined</option>
                            </select>
                          </td>
                          <td class="px-4 py-2">
                            <div class="flex space-x-2">
                              <button 
                                on:click={() => removeAttendance(record.id)}
                                disabled={deleting === record.id}
                                class="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                              >
                                {deleting === record.id ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
