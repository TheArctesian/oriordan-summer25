<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let event = null;
  let attendees = [];
  let loading = true;
  let error = null;
  let currentUser = null; // This would come from your auth system
  let userStatus = null;
  
  // Check if current route is admin
  $: isAdminRoute = $page.url.pathname.startsWith('/admin');

  onMount(async () => {
    try {
      const eventId = $page.params.id;
      const [eventResponse, attendeesResponse] = await Promise.all([
        fetch(`/api/public/events/${eventId}`).then(r => {
          if (!r.ok) throw new Error('Event not found');
          return r.json();
        }),
        fetch(`/api/public/events/${eventId}/attendees`).then(r => r.json()),
      ]);
      
      event = eventResponse;
      attendees = attendeesResponse;
      
      // If user is logged in, check their attendance status
      if (currentUser) {
        const userAttendance = attendees.find(a => a.id === currentUser.id);
        if (userAttendance) {
          userStatus = userAttendance.status;
        }
      }
      
      loading = false;
    } catch (e) {
      console.error('Error loading event details:', e);
      error = e.message;
      loading = false;
    }
  });

  // Group attendees by status
  $: confirmedAttendees = attendees.filter(a => a.status === 'Confirmed');
  $: maybeAttendees = attendees.filter(a => a.status === 'Maybe');
  $: declinedAttendees = attendees.filter(a => a.status === 'Declined');
  
  // Format date
  $: formattedDate = event ? new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
</script>

<div class="min-h-screen bg-irish-stone-light pb-16">
  {#if loading}
    <div class="py-16 text-center">
      <p class="text-irish-navy-light text-lg">Loading event details...</p>
    </div>
  {:else if error}
    <div class="py-16 text-center">
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-lg">
        <p>{error}</p>
      </div>
      <a href="/events" class="mt-4 inline-block text-irish-navy hover:text-irish-green">
        ← Back to all events
      </a>
    </div>
  {:else if event}
    <!-- Event Header -->
    <div class="bg-irish-navy text-white py-12 px-4">
      <div class="max-w-5xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <p class="text-lg opacity-90">{formattedDate}</p>
            <p class="opacity-80">{event.startTime} - {event.endTime} | {event.location}</p>
          </div>
          
          <div class="flex gap-3">
            {#if currentUser}
              <div class="bg-white rounded-lg p-3 text-center">
                <p class="text-irish-navy text-sm mb-2">Your status:</p>
                <div class="flex gap-2">
                  <button 
                    class={`px-3 py-1 rounded text-xs font-medium ${userStatus === 'Confirmed' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                  >
                    Going
                  </button>
                  <button 
                    class={`px-3 py-1 rounded text-xs font-medium ${userStatus === 'Maybe' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                  >
                    Maybe
                  </button>
                  <button 
                    class={`px-3 py-1 rounded text-xs font-medium ${userStatus === 'Declined' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                  >
                    Not Going
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <div class="max-w-5xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Event Details -->
        <div class="md:col-span-2">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            {#if event.imageUrl}
              <img src={event.imageUrl} alt={event.title} class="w-full h-64 object-cover rounded-lg mb-6" />
            {:else}
              <div class="w-full h-48 bg-irish-stone-light flex items-center justify-center rounded-lg mb-6 irish-pattern">
                <span class="text-irish-navy font-bold text-xl">{event.title}</span>
              </div>
            {/if}
            
            <h2 class="text-2xl font-bold text-irish-navy mb-4">About This Event</h2>
            <div class="prose max-w-none text-gray-700">
              <p class="whitespace-pre-line">{event.description}</p>
            </div>
            
            {#if event.notes}
              <div class="mt-6 bg-irish-stone-light p-4 rounded-lg">
                <h3 class="text-lg font-semibold text-irish-navy mb-2">Additional Information</h3>
                <p class="text-gray-700">{event.notes}</p>
              </div>
            {/if}
            
            {#if event.price}
              <div class="mt-6">
                <h3 class="text-lg font-semibold text-irish-navy mb-2">Price</h3>
                <p class="text-gray-700">{event.price}</p>
              </div>
            {/if}
            
            {#if event.maxAttendees}
              <div class="mt-6">
                <h3 class="text-lg font-semibold text-irish-navy mb-2">Capacity</h3>
                <p class="text-gray-700">
                  Maximum attendees: {event.maxAttendees} 
                  <span class="text-sm text-gray-500">
                    ({confirmedAttendees.length} confirmed so far)
                  </span>
                </p>
              </div>
            {/if}
            
            {#if event.responsiblePerson || event.contactDetails}
              <div class="mt-6 border-t border-irish-stone pt-6">
                <h3 class="text-lg font-semibold text-irish-navy mb-2">Contact</h3>
                {#if event.responsiblePerson}
                  <p class="text-gray-700">
                    <span class="font-medium">Organizer:</span> {event.responsiblePerson}
                  </p>
                {/if}
                {#if event.contactDetails}
                  <p class="text-gray-700">
                    <span class="font-medium">Contact:</span> {event.contactDetails}
                  </p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Attendees Sidebar -->
        <div>
          <div class="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 class="text-xl font-bold text-irish-navy mb-4">Who's Attending</h2>
            
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-irish-navy">Confirmed</h3>
                <span class="text-sm bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                  {confirmedAttendees.length}
                </span>
              </div>
              
              {#if confirmedAttendees.length === 0}
                <p class="text-sm text-gray-500 italic">No confirmed attendees yet</p>
              {:else}
                <ul class="space-y-1 max-h-32 overflow-y-auto">
                  {#each confirmedAttendees as attendee}
                    <li class="text-sm text-gray-700 flex items-center gap-2">
                      <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                      {attendee.firstName} {attendee.lastName}
                      {#if attendee.countryId}
                        <span class="text-xs text-gray-500">({attendee.countryId})</span>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            
            <div class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-irish-navy">Maybe</h3>
                <span class="text-sm bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">
                  {maybeAttendees.length}
                </span>
              </div>
              
              {#if maybeAttendees.length === 0}
                <p class="text-sm text-gray-500 italic">No one has responded with "maybe" yet</p>
              {:else}
                <ul class="space-y-1 max-h-24 overflow-y-auto">
                  {#each maybeAttendees as attendee}
                    <li class="text-sm text-gray-700 flex items-center gap-2">
                      <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      {attendee.firstName} {attendee.lastName}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-irish-navy">Declined</h3>
                <span class="text-sm bg-red-100 text-red-800 rounded-full px-2 py-0.5">
                  {declinedAttendees.length}
                </span>
              </div>
              
              {#if declinedAttendees.length === 0}
                <p class="text-sm text-gray-500 italic">No one has declined yet</p>
              {:else}
                <ul class="space-y-1 max-h-24 overflow-y-auto">
                  {#each declinedAttendees as attendee}
                    <li class="text-sm text-gray-700 flex items-center gap-2">
                      <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                      {attendee.firstName} {attendee.lastName}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
            
            {#if attendees.length > 0}
              <div class="mt-6 pt-4 border-t border-irish-stone">
                <div class="flex items-center justify-between text-sm text-gray-600">
                  <span>Total Responses:</span>
                  <span>{attendees.length}</span>
                </div>
              </div>
            {/if}
            
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
