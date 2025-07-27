<script lang="ts">
	import { onMount } from 'svelte';

	let accommodations = [];
	let loading = true;
	let searchTerm = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/public/accommodations');
			accommodations = await response.json();
			loading = false;
		} catch (error) {
			console.error('Failed to load accommodations', error);
			loading = false;
		}
	});

	$: filteredAccommodations = searchTerm
		? accommodations.filter(
				(acc) =>
					acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(acc.address && acc.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
					(acc.notes && acc.notes.toLowerCase().includes(searchTerm.toLowerCase()))
			)
		: accommodations;
</script>

<div class="min-h-screen bg-irish-stone-light pb-16">
	<!-- Hero Section -->
	<div class="bg-irish-navy px-4 py-12 text-white">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="mb-4 text-4xl font-bold">Accommodations</h1>
			<p class="mb-6 text-lg">Find the perfect place to stay during Ireland Weekend 2025</p>

			<div class="mx-auto max-w-lg">
				<input
					type="text"
					bind:value={searchTerm}
					placeholder="Search accommodations..."
					class="w-full rounded-lg border border-irish-stone px-4 py-2 text-irish-navy focus:outline-none focus:ring-2 focus:ring-irish-green"
				/>
			</div>
		</div>
	</div>

	<!-- Accommodations Section -->
	<div class="mx-auto max-w-6xl px-4 py-8">
		{#if loading}
			<div class="py-8 text-center">
				<p class="text-irish-navy-light">Loading accommodations...</p>
			</div>
		{:else if accommodations.length === 0}
			<div class="rounded-lg bg-white py-8 text-center shadow">
				<h2 class="mb-4 text-2xl font-bold text-irish-navy">Coming Soon!</h2>
				<p class="text-irish-navy">Accommodation information will be available soon.</p>
				<p class="mt-2 text-sm text-gray-600">Check back later for updates on available places to stay.</p>
			</div>
		{:else if filteredAccommodations.length === 0}
			<div class="rounded-lg bg-white py-8 text-center shadow">
				<p class="text-irish-navy">No accommodations match your search.</p>
				<button
					on:click={() => (searchTerm = '')}
					class="mt-4 rounded bg-irish-navy px-4 py-2 text-white transition-colors hover:bg-irish-navy-light"
				>
					Reset Search
				</button>
			</div>
		{:else}
			<!-- Accommodations Grid -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredAccommodations as accommodation}
					<div class="overflow-hidden rounded-lg border border-irish-stone bg-white shadow-md transition-shadow hover:shadow-lg">
						<!-- Accommodation Image -->
						{#if accommodation.notes}
							<img 
								src={accommodation.notes} 
								alt={accommodation.name} 
								class="h-48 w-full object-cover"
							/>
						{:else}
							<div class="irish-pattern flex h-32 w-full items-center justify-center bg-irish-stone-light">
								<span class="text-xl font-bold text-irish-navy">{accommodation.name}</span>
							</div>
						{/if}

						<!-- Accommodation Details -->
						<div class="p-6">
							<h3 class="mb-3 text-xl font-bold text-irish-navy">{accommodation.name}</h3>

							{#if accommodation.address}
								<div class="mb-3">
									<span class="font-medium text-irish-navy">📍 Address:</span>
									<p class="mt-1 text-gray-700">{accommodation.address}</p>
								</div>
							{/if}

							{#if accommodation.capacity}
								<div class="mb-4">
									<span class="font-medium text-irish-navy">👥 Capacity:</span>
									<p class="mt-1 text-gray-700">{accommodation.capacity}</p>
								</div>
							{/if}

							<!-- Action Buttons -->
							<div class="flex gap-3">
								<a
									href={`/accommodations/${accommodation.id}`}
									class="flex-1 rounded-lg bg-irish-green px-4 py-2 text-center text-white transition-colors hover:bg-irish-green-dark"
								>
									View Details
								</a>
								{#if accommodation.address}
									<a
										href={`https://maps.google.com/?q=${encodeURIComponent(accommodation.address)}`}
										target="_blank"
										rel="noopener noreferrer"
										class="rounded-lg border border-irish-green px-4 py-2 text-irish-green transition-colors hover:bg-irish-green hover:text-white"
									>
										📍 Map
									</a>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Results Count -->
			<div class="mt-8 text-center">
				<p class="text-sm text-gray-600">
					Showing {filteredAccommodations.length} of {accommodations.length} accommodations
				</p>
			</div>
		{/if}
	</div>

	<!-- Additional Information -->
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-4 text-2xl font-bold text-irish-navy">Need Help Finding Accommodation?</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<h3 class="mb-2 font-semibold text-irish-navy">🏨 Hotels & B&Bs</h3>
					<p class="text-gray-700">We've partnered with local accommodations to offer special rates for Ireland Weekend attendees.</p>
				</div>
				<div>
					<h3 class="mb-2 font-semibold text-irish-navy">🏠 Shared Housing</h3>
					<p class="text-gray-700">Connect with other attendees to share accommodation costs and make new friends!</p>
				</div>
				<div>
					<h3 class="mb-2 font-semibold text-irish-navy">🚗 Location Tips</h3>
					<p class="text-gray-700">All listed accommodations are within easy reach of event venues via public transport or short drives.</p>
				</div>
				<div>
					<h3 class="mb-2 font-semibold text-irish-navy">📞 Questions?</h3>
					<p class="text-gray-700">Contact our accommodation team if you need help finding the perfect place to stay.</p>
				</div>
			</div>
		</div>
	</div>
</div>