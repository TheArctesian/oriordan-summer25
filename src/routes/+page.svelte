<script lang="ts">
	import { onMount } from 'svelte';

	let upcomingEvents = [];
	let loading = true;

	onMount(async () => {
		try {
			const response = await fetch('/api/public/events/upcoming');
			upcomingEvents = await response.json();
			loading = false;
		} catch (error) {
			console.error('Failed to load upcoming events', error);
			loading = false;
		}
	});
</script>

<div>
	<!-- Hero Section -->
	<div class="relative overflow-hidden bg-irish-navy px-4 py-20 text-white">
		<!-- Celtic pattern overlay -->
		<div class="irish-pattern absolute inset-0 opacity-10"></div>

		<div class="relative z-10 mx-auto max-w-4xl text-center">
			<h1 class="mb-6 text-5xl font-bold">Ireland Weekend 2025</h1>
			<p class="mb-8 text-xl">Join us for an unforgettable weekend in beautiful Ireland</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<a
					href="/events"
					class="rounded-lg bg-irish-green px-6 py-3 font-bold text-white transition-colors hover:bg-irish-green-dark"
				>
					View Events
				</a>
				<a
					href="/register"
					class="rounded-lg bg-irish-orange px-6 py-3 font-bold text-white transition-colors hover:bg-irish-orange-dark"
				>
					Register Now
				</a>
			</div>
		</div>
	</div>

	<!-- Upcoming Events Section -->
	<div class="mx-auto max-w-6xl px-4 py-16">
		<h2 class="mb-8 text-center text-3xl font-bold text-irish-navy">Upcoming Events</h2>

		{#if loading}
			<div class="py-8 text-center">
				<p class="text-irish-navy-light">Loading events...</p>
			</div>
		{:else if upcomingEvents.length === 0}
			<div class="rounded-lg bg-white py-8 text-center shadow">
				<p class="text-irish-navy">No upcoming events found.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each upcomingEvents as event}
					<div
						class="overflow-hidden rounded-lg border border-irish-stone bg-white shadow-md transition-shadow hover:shadow-lg"
					>
						{#if event.imageUrl}
							<img src={event.imageUrl} alt={event.title} class="h-48 w-full object-cover" />
						{:else}
							<div
								class="irish-pattern flex h-48 w-full items-center justify-center bg-irish-stone-light"
							>
								<span class="text-xl font-bold text-irish-navy">{event.title}</span>
							</div>
						{/if}
						<div class="p-6">
							<h3 class="mb-2 text-xl font-bold text-irish-navy">{event.title}</h3>
							<p class="mb-4 text-gray-600">
								<span class="font-semibold">Date:</span>
								{new Date(event.date).toLocaleDateString()}
								<br />
								<span class="font-semibold">Time:</span>
								{event.startTime} - {event.endTime}
								<br />
								<span class="font-semibold">Location:</span>
								{event.location}
							</p>
							<p class="mb-4 line-clamp-3 text-gray-700">{event.description}</p>
							<a
								href={`/events/${event.id}`}
								class="inline-block rounded bg-irish-green px-4 py-2 font-bold text-white transition-colors hover:bg-irish-green-dark"
							>
								View Details
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
