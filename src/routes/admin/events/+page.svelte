<script lang="ts">
  import { onMount } from 'svelte';
  import { events, eventsLoading, eventsError } from '$lib/stores/admin';
  import { eventsService } from '$lib/services/adminService';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Table from '$lib/components/ui/Table.svelte';
  import Loading from '$lib/components/ui/Loading.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';

  let searchTerm = '';
  let deleting: number | null = null;

  onMount(() => {
    eventsService.loadAll();
  });

  $: filteredEvents = searchTerm 
    ? $events.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : $events;

  async function deleteEvent(eventId: number) {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    deleting = eventId;
    const response = await eventsService.delete(eventId);
    
    if (!response.success) {
      alert('Failed to delete event: ' + response.error);
    }
    
    deleting = null;
  }
</script>

<PageHeader title="Events">
  <Button href="/admin/events/new" variant="primary">Create New Event</Button>
</PageHeader>

{#if $eventsError}
  <Alert type="error" dismissible>{$eventsError}</Alert>
{/if}

{#if $eventsLoading}
  <Loading message="Loading events..." />
{:else if $events.length === 0}
  <EmptyState 
    title="No events found" 
    description="Get started by creating your first event."
    actionText="Create Your First Event"
    actionHref="/admin/events/new"
  />
{:else}
  <Table 
    headers={['Date', 'Time', 'Title', 'Location', 'Status', 'Actions']}
    searchable={true}
    searchPlaceholder="Search events..."
    bind:searchValue={searchTerm}
  >
    <div slot="header">
      <div class="text-sm text-gray-600">
        Showing {filteredEvents.length} of {$events.length} events
      </div>
    </div>

    {#if filteredEvents.length === 0}
      <tr>
        <td colspan="6" class="px-4 py-8 text-center">
          <EmptyState 
            title="No events match your search"
            actionText="Clear Search"
          >
            <Button on:click={() => searchTerm = ''} variant="secondary">Clear Search</Button>
          </EmptyState>
        </td>
      </tr>
    {:else}
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
              <Button 
                href={`/admin/events/${event.id}/edit`} 
                variant="secondary" 
                size="sm"
              >
                Edit
              </Button>
              <Button 
                on:click={() => deleteEvent(event.id)}
                disabled={deleting === event.id}
                variant="danger"
                size="sm"
              >
                {deleting === event.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </td>
        </tr>
      {/each}
    {/if}
  </Table>
{/if}
