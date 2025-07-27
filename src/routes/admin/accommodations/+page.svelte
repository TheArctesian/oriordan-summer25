<script lang="ts">
	import { onMount } from 'svelte';
	import { accommodations, accommodationsLoading, accommodationsError } from '$lib/stores/admin';
	import { accommodationsService } from '$lib/services/adminService';
	import Button from '$lib/components/ui/Button.svelte';
	import Table from '$lib/components/ui/Table.svelte';
	import Loading from '$lib/components/ui/Loading.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';

	let searchTerm = '';
	let deleting: number | null = null;

	onMount(() => {
		accommodationsService.loadAll();
	});

	$: filteredAccommodations = searchTerm
		? $accommodations.filter(
				(a) =>
					a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(a.address && a.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
					(a.notes && a.notes.toLowerCase().includes(searchTerm.toLowerCase()))
			)
		: $accommodations;

	async function deleteAccommodation(accommodationId: number) {
		if (!confirm('Are you sure you want to delete this accommodation?')) {
			return;
		}

		deleting = accommodationId;
		const response = await accommodationsService.delete(accommodationId);
		
		if (!response.success) {
			alert('Failed to delete accommodation: ' + response.error);
		}
		
		deleting = null;
	}
</script>

<PageHeader title="Accommodations">
	<Button href="/admin/accommodations/new" variant="primary">Add New Accommodation</Button>
</PageHeader>

{#if $accommodationsError}
	<Alert type="error" dismissible>{$accommodationsError}</Alert>
{/if}

{#if $accommodationsLoading}
	<Loading message="Loading accommodations..." />
{:else if $accommodations.length === 0}
	<EmptyState 
		title="No accommodations found" 
		description="Get started by adding your first accommodation."
		actionText="Add Your First Accommodation"
		actionHref="/admin/accommodations/new"
	/>
{:else}
	<Table 
		headers={['Name', 'Address', 'Capacity', 'Notes', 'Actions']}
		searchable={true}
		searchPlaceholder="Search accommodations..."
		bind:searchValue={searchTerm}
	>
		<div slot="header">
			<div class="text-sm text-gray-600">
				Showing {filteredAccommodations.length} of {$accommodations.length} accommodations
			</div>
		</div>

		{#if filteredAccommodations.length === 0}
			<tr>
				<td colspan="5" class="px-4 py-8 text-center">
					<EmptyState 
						title="No accommodations match your search"
						actionText="Clear Search"
					>
						<Button on:click={() => searchTerm = ''} variant="secondary">Clear Search</Button>
					</EmptyState>
				</td>
			</tr>
		{:else}
			{#each filteredAccommodations as accommodation}
				<tr class="hover:bg-irish-stone-light">
					<td class="px-4 py-3 font-medium">{accommodation.name}</td>
					<td class="px-4 py-3">{accommodation.address || '-'}</td>
					<td class="px-4 py-3">{accommodation.capacity || '-'}</td>
					<td class="max-w-xs truncate px-4 py-3">{accommodation.notes || '-'}</td>
					<td class="px-4 py-3">
						<div class="flex space-x-2">
							<Button 
								href={`/admin/accommodations/${accommodation.id}/edit`} 
								variant="secondary" 
								size="sm"
							>
								Edit
							</Button>
							<Button 
								on:click={() => deleteAccommodation(accommodation.id)}
								disabled={deleting === accommodation.id}
								variant="danger"
								size="sm"
							>
								{deleting === accommodation.id ? 'Deleting...' : 'Delete'}
							</Button>
						</div>
					</td>
				</tr>
			{/each}
		{/if}
	</Table>
{/if}
