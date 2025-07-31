<script lang="ts">
	import { onMount } from 'svelte';
	import { attendees, attendeesLoading, attendeesError, accommodations } from '$lib/stores/admin';
	import { attendeesService, accommodationsService } from '$lib/services/adminService';
	import Button from '$lib/components/ui/Button.svelte';
	import Table from '$lib/components/ui/Table.svelte';
	import Loading from '$lib/components/ui/Loading.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let searchTerm = '';
	let deleting: number | null = null;

	onMount(() => {
		attendeesService.loadAll();
		accommodationsService.loadAll();
	});

	$: filteredAttendees = searchTerm
		? $attendees.filter(
				(a) =>
					`${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
					(a.countryId && a.countryId.toLowerCase().includes(searchTerm.toLowerCase()))
			)
		: $attendees;

	function getAccommodationName(accommodationId: number | null): string {
		if (!accommodationId) return 'Not assigned';
		const accommodation = $accommodations.find(acc => acc.id === accommodationId);
		return accommodation?.name || 'Unknown';
	}

	async function deleteAttendee(attendeeId: number) {
		if (!confirm('Are you sure you want to delete this attendee?')) {
			return;
		}

		deleting = attendeeId;
		const response = await attendeesService.delete(attendeeId);

		if (!response.success) {
			alert('Failed to delete attendee: ' + response.error);
		}

		deleting = null;
	}
</script>

<PageHeader title="Attendees">
	<Button href="/admin/attendees/new" variant="primary">Add New Attendee</Button>
</PageHeader>

{#if $attendeesError}
	<Alert type="error" dismissible>{$attendeesError}</Alert>
{/if}

{#if $attendeesLoading}
	<Loading message="Loading attendees..." />
{:else if $attendees.length === 0}
	<EmptyState
		title="No attendees found"
		description="Get started by adding your first attendee."
		actionText="Add Your First Attendee"
		actionHref="/admin/attendees/new"
	/>
{:else}
	<Table
		headers={['Name', 'Email', 'Country', 'Accommodation', 'Location', 'Status', 'Actions']}
		searchable={true}
		searchPlaceholder="Search attendees..."
		bind:searchValue={searchTerm}
	>
		<div slot="header">
			<div class="text-sm text-gray-600">
				Showing {filteredAttendees.length} of {$attendees.length} attendees
			</div>
		</div>

		{#if filteredAttendees.length === 0}
			<tr>
				<td colspan="7" class="px-4 py-8 text-center">
					<EmptyState title="No attendees match your search" actionText="Clear Search">
						<Button on:click={() => (searchTerm = '')} variant="secondary">Clear Search</Button>
					</EmptyState>
				</td>
			</tr>
		{:else}
			{#each filteredAttendees as attendee}
				<tr class="hover:bg-irish-stone-light">
					<td class="px-4 py-3">{attendee.firstName} {attendee.lastName}</td>
					<td class="px-4 py-3">{attendee.email || '-'}</td>
					<td class="px-4 py-3">{attendee.countryId || '-'}</td>
					<td class="px-4 py-3">{getAccommodationName(attendee.accommodationId)}</td>
					<td class="px-4 py-3">{attendee.accommodationLocation || '-'}</td>
					<td class="px-4 py-3">
						<span
							class={`rounded-full px-2 py-1 text-xs ${attendee.isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
						>
							{attendee.isConfirmed ? 'Confirmed' : 'Pending'}
						</span>
					</td>
					<td class="px-4 py-3">
						<div class="flex space-x-2">
							<Button href={`/admin/attendees/${attendee.id}/edit`} variant="secondary" size="sm">
								Edit
							</Button>
							<Button
								on:click={() => deleteAttendee(attendee.id)}
								disabled={deleting === attendee.id}
								variant="danger"
								size="sm"
							>
								{deleting === attendee.id ? 'Deleting...' : 'Delete'}
							</Button>
						</div>
					</td>
				</tr>
			{/each}
		{/if}
	</Table>
{/if}
