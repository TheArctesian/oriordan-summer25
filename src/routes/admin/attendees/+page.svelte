<script lang="ts">
	import { onMount } from 'svelte';

	let attendees = [];
	let loading = true;
	let searchTerm = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/admin/attendees');
			attendees = await response.json();
			loading = false;
		} catch (error) {
			console.error('Failed to load attendees', error);
			loading = false;
		}
	});

	$: filteredAttendees = searchTerm
		? attendees.filter(
				(a) =>
					`${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
					(a.countryId && a.countryId.toLowerCase().includes(searchTerm.toLowerCase()))
			)
		: attendees;
</script>

<div>
	<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<h1 class="text-3xl font-bold text-irish-navy">Attendees</h1>

		<div class="flex flex-col gap-3 sm:flex-row">
			<div class="relative">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search attendees..."
					class="rounded-lg border border-irish-stone px-4 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
				/>
			</div>

			<a
				href="/admin/attendees/new"
				class="whitespace-nowrap rounded bg-irish-green px-4 py-2 text-white transition-colors hover:bg-irish-green-dark"
			>
				Add New Attendee
			</a>
		</div>
	</div>

	{#if loading}
		<div class="py-8 text-center">
			<p class="text-irish-navy-light">Loading attendees...</p>
		</div>
	{:else if attendees.length === 0}
		<div class="rounded-lg bg-irish-stone-light py-8 text-center">
			<p class="text-irish-navy">No attendees found.</p>
			<a
				href="/admin/attendees/new"
				class="mt-4 inline-block rounded bg-irish-green px-4 py-2 text-white transition-colors hover:bg-irish-green-dark"
			>
				Add Your First Attendee
			</a>
		</div>
	{:else if filteredAttendees.length === 0}
		<div class="rounded-lg bg-irish-stone-light py-8 text-center">
			<p class="text-irish-navy">No attendees match your search.</p>
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
						<th class="px-4 py-3 text-left">Email</th>
						<th class="px-4 py-3 text-left">Country</th>
						<th class="px-4 py-3 text-left">Accommodation</th>
						<th class="px-4 py-3 text-left">Status</th>
						<th class="px-4 py-3 text-left">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-irish-stone">
					{#each filteredAttendees as attendee}
						<tr class="hover:bg-irish-stone-light">
							<td class="px-4 py-3">{attendee.firstName} {attendee.lastName}</td>
							<td class="px-4 py-3">{attendee.email || '-'}</td>
							<td class="px-4 py-3">{attendee.countryId || '-'}</td>
							<td class="px-4 py-3">{attendee.accommodationName || 'Not assigned'}</td>
							<td class="px-4 py-3">
								<span
									class={`rounded-full px-2 py-1 text-xs ${attendee.isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
								>
									{attendee.isConfirmed ? 'Confirmed' : 'Pending'}
								</span>
							</td>
							<td class="px-4 py-3">
								<div class="flex space-x-2">
									<a
										href={`/admin/attendees/${attendee.id}/edit`}
										class="text-irish-navy hover:text-irish-green">Edit</a
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
			Showing {filteredAttendees.length} of {attendees.length} attendees
		</div>
	{/if}
</div>
