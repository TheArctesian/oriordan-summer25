<script lang="ts">
  import { onMount } from 'svelte';

  let events = [];
  let loading = true;
  let searchTerm = '';

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/events');
      events = await response.json();
      loading = false;
    } catch (error) {
      console.error('Failed to load events', error);
      loading = false;
    }
  });

  $: filteredEvents = searchTerm 
    ? events.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : events;
</script>

<div>
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <h1 class="text-irish-navy text-3xl font-bold">Events</h1>
    
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative">
        <input 
          type="text" 
          bind:value={searchTerm} 
          placeholder="Search events..." 
          class="border border-irish-stone rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
        />
      </div>

      <a
        href="/admin/events/new"
        class="bg-irish-orange hover:bg-irish-orange-dark rounded px-4 py-2 text-white transition-colors whitespace-nowrap"
      >
        Create New Event
      </a>
    </div>
  </div>

  {#if loading}
    <div class="py-8 text-center">
      <p class="text-irish-navy-light">Loading events...</p>
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
  {:else if filteredEvents.length === 0}
    <div class="bg-irish-stone-light rounded-lg py-8 text-center">
      <p class="text-irish-navy">No events match your search.</p>
      <button
        on:click={() => searchTerm = ''}
        class="bg-irish-navy hover:bg-irish-navy-light mt-4 inline-block rounded px-4 py-2 text-white transition-colors"
      >
        Clear Search
      </button>
    </div>
  {:else}
    <div class="overflow-x-auto rounded-lg border border-irish-stone shadow">
      <table class="min-w-full overflow-hidden bg-white">
        <thead class="bg-irish-navy text-white">
          <tr>
            <th class="px-4 py-3 text-left">Date</th>
            <th class="px-4 py-3 text-left">Time</th>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">Location</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-irish-stone divide-y">
          {#each filteredEvents as event}
            <tr class="hover:bg-irish-stone-light">
              <td class="px-4 py-3">{new Date(event.date).toLocaleDateString()}</td>
              <td class="px-4 py-3">{event.startTime} - {event.endTime}</td>
              <td class="px-4 py-3 font-medium">{event.title}</td>
              <td class="px-4 py-3">{event.location || '-'}</td>
              <td class="px-4 py-3">
                <span
                  class={`rounded-full px-2 py-1 text-xs ${
                    event.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
                    event.status === 'Tentative' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {event.status || 'Draft'}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex space-x-2">
                  <a
                    href={`/admin/events/${event.id}/edit`}
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
      Showing {filteredEvents.length} of {events.length} events
    </div>
  {/if}
</div>
