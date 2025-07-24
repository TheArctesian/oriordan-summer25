<script lang="ts">
	import { onMount } from 'svelte';

	let accommodations = [];
	let loading = true;
	let searchTerm = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/admin/accommodations');
			accommodations = await response.json();
			loading = false;
		} catch (error) {
			console.error('Failed to load accommodations', error);
			loading = false;
		}
	});

	$: filteredAccommodations = searchTerm
		? accommodations.filter(
				(a) =>
					a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(a.address && a.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
					(a.notes && a.notes.toLowerCase().includes(searchTerm.toLowerCase()))
			)
		: accommodations;
</script>

<div>
	<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<h1 class="text-3xl font-bold text-irish-navy">Accommodations</h1>

		<div class="flex flex-col gap-3 sm:flex-row">
			<div class="relative">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search accommodations..."
					class="rounded-lg border border-irish-stone px-4 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
				/>
			</div>

			<a
				href="/admin/accommodations/new"
				class="whitespace-nowrap rounded bg-irish-navy px-4 py-2 text-white transition-colors hover:bg-irish-navy-light"
			>
				Add New Accommodation
			</a>
		</div>
	</div>

	{#if loading}
		<div class="py-8 text-center">
			<p class="text-irish-navy-light">Loading accommodations...</p>
		</div>
	{:else if accommodations.length === 0}
		<div class="rounded-lg bg-irish-stone-light py-8 text-center">
			<p class="text-irish-navy">No accommodations found.</p>
			<a
				href="/admin/accommodations/new"
				class="mt-4 inline-block rounded bg-irish-navy px-4 py-2 text-white transition-colors hover:bg-irish-navy-light"
			>
				Add Your First Accommodation
			</a>
		</div>
	{:else if filteredAccommodations.length === 0}
		<div class="rounded-lg bg-irish-stone-light py-8 text-center">
			<p class="text-irish-navy">No accommodations match your search.</p>
			<button
				on:click={() => (searchTerm = '')}
				class="mt-4 inline-block rounded bg-irish-navy px-4 py-2 text-white transition-colors hover:bg-irish-navy-light"
			>
				Clear Search
			</button>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-irish-stone shadow">
			<table class="min-w-full overflow-hidden bg-white">
				<thead class="bg-irish-navy text-white">
					<tr>
						<th class="px-4 py-3 text-left">Name</th>
						<th class="px-4 py-3 text-left">Address</th>
						<th class="px-4 py-3 text-left">Capacity</th>
						<th class="px-4 py-3 text-left">Notes</th>
						<th class="px-4 py-3 text-left">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-irish-stone">
					{#each filteredAccommodations as accommodation}
						<tr class="hover:bg-irish-stone-light">
							<td class="px-4 py-3 font-medium">{accommodation.name}</td>
							<td class="px-4 py-3">{accommodation.address || '-'}</td>
							<td class="px-4 py-3">{accommodation.capacity || '-'}</td>
							<td class="max-w-xs truncate px-4 py-3">{accommodation.notes || '-'}</td>
							<td class="px-4 py-3">
								<div class="flex space-x-2">
									<a
										href={`/admin/accommodations/${accommodation.id}/edit`}
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
			Showing {filteredAccommodations.length} of {accommodations.length} accommodations
		</div>
	{/if}
</div>
