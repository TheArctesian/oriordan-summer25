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

	<!-- About Section -->
	<div class="bg-irish-stone px-4 py-16">
		<div class="mx-auto max-w-4xl">
			<h2 class="mb-6 text-center text-3xl font-bold text-irish-navy">About The Weekend</h2>
			<p class="mb-8 text-center text-lg text-irish-navy">
				Join us for a special weekend in Ireland, celebrating with friends and family in the
				beautiful Irish countryside. This gathering will feature a variety of events, from casual
				get-togethers to structured activities.
			</p>
			<div class="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
				<div class="rounded-lg border border-irish-stone bg-white p-6 shadow">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-irish-green text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-8 w-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>
					<h3 class="mb-3 text-xl font-bold text-irish-green">Beautiful Location</h3>
					<p>Experience the stunning landscapes and warm hospitality of Ireland.</p>
				</div>
				<div class="rounded-lg border border-irish-stone bg-white p-6 shadow">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-irish-orange text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-8 w-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
							/>
						</svg>
					</div>
					<h3 class="mb-3 text-xl font-bold text-irish-orange">Fun Activities</h3>
					<p>From casual gatherings to organized events, there's something for everyone.</p>
				</div>
				<div class="rounded-lg border border-irish-stone bg-white p-6 shadow">
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-irish-navy text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-8 w-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					</div>
					<h3 class="mb-3 text-xl font-bold text-irish-navy">Great Company</h3>
					<p>Connect with friends and family in a relaxed and enjoyable atmosphere.</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Countdown Section -->
	<div class="bg-irish-white px-4 py-16">
		<div class="mx-auto max-w-4xl text-center">
			<h2 class="mb-6 text-3xl font-bold text-irish-navy">Coming Soon</h2>
			<p class="mb-8 text-lg text-irish-navy-light">
				Mark your calendars for August 2025. We're counting down the days!
			</p>

			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div class="rounded-lg bg-irish-navy p-6 text-white">
					<div class="text-4xl font-bold">365</div>
					<div class="text-sm uppercase">Days</div>
				</div>
				<div class="rounded-lg bg-irish-navy p-6 text-white">
					<div class="text-4xl font-bold">24</div>
					<div class="text-sm uppercase">Hours</div>
				</div>
				<div class="rounded-lg bg-irish-navy p-6 text-white">
					<div class="text-4xl font-bold">60</div>
					<div class="text-sm uppercase">Minutes</div>
				</div>
				<div class="rounded-lg bg-irish-navy p-6 text-white">
					<div class="text-4xl font-bold">60</div>
					<div class="text-sm uppercase">Seconds</div>
				</div>
			</div>

			<div class="mt-8">
				<a
					href="/register"
					class="inline-block rounded-lg bg-irish-orange px-8 py-3 font-bold text-white transition-colors hover:bg-irish-orange-dark"
				>
					Register Now
				</a>
			</div>
		</div>
	</div>
</div>
