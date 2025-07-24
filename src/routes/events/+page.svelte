<script lang="ts">
	import { onMount } from 'svelte';

	let events = [];
	let loading = true;
	let searchTerm = '';
	let selectedDate = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/public/events');
			events = await response.json();
			loading = false;
		} catch (error) {
			console.error('Failed to load events', error);
			loading = false;
		}
	});

	// Get unique dates for filter
	$: uniqueDates = [...new Set(events.map((event) => event.date))].sort();

	$: filteredEvents = events.filter(
		(event) =>
			(!searchTerm ||
				event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))) &&
			(!selectedDate || event.date === selectedDate)
	);
</script>

<div class="min-h-screen bg-irish-stone-light pb-16">
	<!-- Hero Section -->
	<div class="bg-irish-navy px-4 py-12 text-white">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="mb-4 text-4xl font-bold">Events Schedule</h1>
			<p class="mb-6 text-lg">Discover all the exciting events planned for our Ireland Weekend</p>

			<div class="mx-auto max-w-lg">
				<div class="flex flex-col justify-center gap-3 sm:flex-row">
					<input
						type="text"
						bind:value={searchTerm}
						placeholder="Search events..."
						class="w-full rounded-lg border border-irish-stone px-4 py-2 text-irish-navy focus:outline-none focus:ring-2 focus:ring-irish-green"
					/>

					<select
						bind:value={selectedDate}
						class="rounded-lg border border-irish-stone px-4 py-2 text-irish-navy focus:outline-none focus:ring-2 focus:ring-irish-green"
					>
						<option value="">All Dates</option>
						{#each uniqueDates as date}
							<option value={date}
								>{new Date(date).toLocaleDateString('en-US', {
									weekday: 'long',
									month: 'long',
									day: 'numeric'
								})}</option
							>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Events Section -->
	<div class="mx-auto max-w-6xl px-4 py-8">
		{#if loading}
			<div class="py-8 text-center">
				<p class="text-irish-navy-light">Loading events...</p>
			</div>
		{:else if events.length === 0}
			<div class="rounded-lg bg-white py-8 text-center shadow">
				<p class="text-irish-navy">No events found.</p>
			</div>
		{:else if filteredEvents.length === 0}
			<div class="rounded-lg bg-white py-8 text-center shadow">
				<p class="text-irish-navy">No events match your search criteria.</p>
				<div class="mt-4 flex justify-center gap-3">
					<button
						on:click={() => {
							searchTerm = '';
							selectedDate = '';
						}}
						class="rounded bg-irish-navy px-4 py-2 text-white transition-colors hover:bg-irish-navy-light"
					>
						Reset Filters
					</button>
				</div>
			</div>
		{:else}
			<!-- Group events by date -->
			{#each [...new Set(filteredEvents.map((event) => event.date))].sort() as date}
				<div class="mb-10">
					<h2 class="mb-4 border-b-2 border-irish-green pb-2 text-2xl font-bold text-irish-navy">
						{new Date(date).toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric'
						})}
					</h2>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{#each filteredEvents.filter((event) => event.date === date) as event}
							<div
								class="overflow-hidden rounded-lg border border-irish-stone bg-white shadow-md transition-shadow hover:shadow-lg"
							>
								{#if event.imageUrl}
									<img src={event.imageUrl} alt={event.title} class="h-48 w-full object-cover" />
								{:else}
									<div
										class="irish-pattern flex h-32 w-full items-center justify-center bg-irish-stone-light"
									>
										<span class="text-xl font-bold text-irish-navy">{event.title}</span>
									</div>
								{/if}

								<div class="p-4">
									<div class="flex items-start justify-between">
										<h3 class="text-xl font-bold text-irish-navy">{event.title}</h3>
										<div class="text-sm text-gray-500">
											{event.startTime} - {event.endTime}
										</div>
									</div>

									<p class="mb-3 mt-1 text-gray-600">
										<span class="font-medium">Location:</span>
										{event.location || 'TBA'}
									</p>

									<p class="mb-4 line-clamp-3 text-gray-700">{event.description}</p>

									<div class="flex items-center justify-between">
										<span class="text-sm text-gray-500">
											{#if event.maxAttendees}
												Max Attendees: {event.maxAttendees}
											{/if}
										</span>

										<a
											href={`/events/${event.id}`}
											class="rounded-lg bg-irish-green px-4 py-2 text-white transition-colors hover:bg-irish-green-dark"
										>
											View Details
										</a>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
