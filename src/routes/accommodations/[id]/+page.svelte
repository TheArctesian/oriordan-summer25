<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let accommodation = null;
	let attendees = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			const accommodationId = $page.params.id;
			const [accommodationResponse, attendeesResponse] = await Promise.all([
				fetch(`/api/public/accommodations/${accommodationId}`).then(r => {
					if (!r.ok) throw new Error('Accommodation not found');
					return r.json();
				}),
				fetch(`/api/public/accommodations/${accommodationId}/attendees`).then(r => r.json()).catch(() => [])
			]);
			
			accommodation = accommodationResponse;
			attendees = attendeesResponse;
			loading = false;
		} catch (e) {
			console.error('Error loading accommodation details:', e);
			error = e.message;
			loading = false;
		}
	});
</script>

<div class="min-h-screen bg-irish-stone-light pb-16">
	{#if loading}
		<div class="py-16 text-center">
			<p class="text-irish-navy-light text-lg">Loading accommodation details...</p>
		</div>
	{:else if error}
		<div class="py-16 text-center">
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-lg">
				<p>{error}</p>
			</div>
			<a href="/accommodations" class="mt-4 inline-block text-irish-navy hover:text-irish-green">
				← Back to all accommodations
			</a>
		</div>
	{:else if accommodation}
		<!-- Accommodation Header -->
		<div class="bg-irish-navy text-white py-12 px-4">
			<div class="max-w-4xl mx-auto">
				<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
					<div>
						<h1 class="text-3xl md:text-4xl font-bold mb-2">{accommodation.name}</h1>
						{#if accommodation.address}
							<p class="text-lg opacity-90">📍 {accommodation.address}</p>
						{/if}
						{#if accommodation.capacity}
							<p class="opacity-80">👥 Capacity: {accommodation.capacity}</p>
						{/if}
					</div>
					
					<div class="flex gap-3">
						{#if accommodation.address}
							<a
								href={`https://maps.google.com/?q=${encodeURIComponent(accommodation.address)}`}
								target="_blank"
								rel="noopener noreferrer"
								class="bg-irish-orange hover:bg-irish-orange-dark text-white px-4 py-2 rounded-lg transition-colors"
							>
								View on Map
							</a>
						{/if}
						<a 
							href="/register" 
							class="bg-irish-green hover:bg-irish-green-dark text-white px-4 py-2 rounded-lg transition-colors"
						>
							Register to Stay
						</a>
					</div>
				</div>
			</div>
		</div>
		
		<div class="max-w-4xl mx-auto px-4 py-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<!-- Accommodation Details -->
				<div class="md:col-span-2">
					<div class="bg-white rounded-lg shadow p-6 mb-6">
						<!-- Accommodation Image -->
						{#if accommodation.notes}
							<img 
								src={accommodation.notes} 
								alt={accommodation.name} 
								class="w-full h-64 object-cover rounded-lg mb-6"
							/>
						{:else}
							<div class="w-full h-64 bg-irish-stone-light flex items-center justify-center rounded-lg mb-6 irish-pattern">
								<span class="text-irish-navy font-bold text-xl">{accommodation.name}</span>
							</div>
						{/if}
						
						<h2 class="text-2xl font-bold text-irish-navy mb-4">About This Accommodation</h2>
						
						<p class="text-gray-700 mb-6">
							{accommodation.name} is one of our recommended accommodations for Ireland Weekend 2025. 
							Perfect for attendees looking for a comfortable and convenient place to stay.
						</p>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							{#if accommodation.address}
								<div>
									<h3 class="text-lg font-semibold text-irish-navy mb-2">📍 Location</h3>
									<p class="text-gray-700">{accommodation.address}</p>
								</div>
							{/if}
							
							{#if accommodation.capacity}
								<div>
									<h3 class="text-lg font-semibold text-irish-navy mb-2">👥 Capacity</h3>
									<p class="text-gray-700">{accommodation.capacity}</p>
								</div>
							{/if}
						</div>
						
						<div class="mt-6 bg-irish-stone-light p-4 rounded-lg">
							<h3 class="text-lg font-semibold text-irish-navy mb-2">🎉 Ireland Weekend Perks</h3>
							<ul class="list-disc list-inside text-gray-700 space-y-1">
								<li>Special rates for event attendees</li>
								<li>Easy access to all event venues</li>
								<li>Connect with fellow Ireland Weekend participants</li>
								<li>Local recommendations from accommodation hosts</li>
							</ul>
						</div>
					</div>
				</div>
				
				<!-- Attendees Sidebar -->
				<div>
					<div class="bg-white rounded-lg shadow p-6 sticky top-4">
						<h2 class="text-xl font-bold text-irish-navy mb-4">Who's Staying Here</h2>
						
						{#if attendees.length === 0}
							<p class="text-gray-500 italic text-center py-4">
								No one has registered to stay here yet.
								<br><br>
								Be the first! 🎉
							</p>
						{:else}
							<div class="space-y-3">
								{#each attendees as attendee}
									<div class="flex items-center gap-3 p-3 bg-irish-stone-light rounded-lg">
										<div class="w-10 h-10 bg-irish-green rounded-full flex items-center justify-center text-white font-bold">
											{attendee.firstName[0]}{attendee.lastName[0]}
										</div>
										<div>
											<p class="font-medium text-irish-navy">
												{attendee.firstName} {attendee.lastName}
											</p>
											{#if attendee.countryId}
												<p class="text-sm text-gray-600">{attendee.countryId}</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
							
							<div class="mt-4 pt-4 border-t border-irish-stone">
								<div class="flex items-center justify-between text-sm text-gray-600">
									<span>Total Guests:</span>
									<span class="font-medium">{attendees.length}</span>
								</div>
								{#if accommodation.capacity}
									<div class="flex items-center justify-between text-sm text-gray-600 mt-1">
										<span>Capacity:</span>
										<span class="font-medium">{accommodation.capacity}</span>
									</div>
								{/if}
							</div>
						{/if}
						
						<div class="mt-6 pt-4 border-t border-irish-stone">
							<a 
								href="/register" 
								class="bg-irish-orange hover:bg-irish-orange-dark text-white px-4 py-2 rounded-lg transition-colors block text-center"
							>
								Register to Stay Here
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>