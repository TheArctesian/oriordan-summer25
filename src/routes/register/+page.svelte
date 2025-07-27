<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let accommodations = [];
	let events = [];
	let loading = false;
	let success = false;
	let error = '';
	let currentStep = 1;
	let registeredAttendeeId = null;

	// Form data
	let formData = {
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		countryId: '',
		accommodationId: '',
		arrivalDate: '',
		departureDate: '',
		specialRequests: '',
		isAdult: true
	};

	// Event selection
	let selectedEvents = new Set();

	onMount(async () => {
		// Load accommodations and events
		try {
			const [accommodationsResponse, eventsResponse] = await Promise.all([
				fetch('/api/public/accommodations'),
				fetch('/api/public/events')
			]);
			accommodations = await accommodationsResponse.json();
			events = await eventsResponse.json();
		} catch (e) {
			console.error('Failed to load data:', e);
		}
	});

	async function handleStep1Submit() {
		error = '';
		loading = true;

		try {
			const response = await fetch('/api/public/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...formData,
					accommodationId: formData.accommodationId ? parseInt(formData.accommodationId) : null
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Registration failed');
			}

			registeredAttendeeId = result.attendee.id;
			currentStep = 2;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	async function handleStep2Submit() {
		error = '';
		loading = true;

		try {
			// Register for selected events
			if (selectedEvents.size > 0) {
				const eventRegistrations = Array.from(selectedEvents).map(eventId => ({
					eventId: parseInt(eventId),
					attendeeId: registeredAttendeeId,
					status: 'Confirmed'
				}));

				const promises = eventRegistrations.map(registration =>
					fetch('/api/public/event-attendance', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(registration)
					})
				);

				await Promise.all(promises);
			}

			success = true;
			setTimeout(() => {
				goto('/');
			}, 3000);
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function toggleEventSelection(eventId) {
		if (selectedEvents.has(eventId)) {
			selectedEvents.delete(eventId);
		} else {
			selectedEvents.add(eventId);
		}
		selectedEvents = new Set(selectedEvents); // Trigger reactivity
	}

	function goBackToStep1() {
		currentStep = 1;
		error = '';
	}

	// Country options (common ones for Ireland Weekend)
	const countries = [
		'Ireland',
		'United Kingdom',
		'United States',
		'Canada',
		'Australia',
		'Germany',
		'France',
		'Spain',
		'Italy',
		'Netherlands',
		'Other'
	];
</script>

<div class="min-h-screen bg-irish-stone-light pb-16">
	<!-- Hero Section -->
	<div class="bg-irish-navy px-4 py-12 text-white">
		<div class="mx-auto max-w-4xl text-center">
			<h1 class="mb-4 text-4xl font-bold">Register for Ireland Weekend 2025</h1>
			<p class="text-lg">Join us for an unforgettable celebration of Irish culture, music, and community!</p>
			
			<!-- Progress Indicator -->
			{#if !success}
				<div class="mt-8 flex justify-center">
					<div class="flex items-center space-x-4">
						<div class="flex items-center">
							<div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-irish-orange text-white' : 'bg-gray-300 text-gray-600'}`}>
								1
							</div>
							<span class="ml-2 text-sm">Personal Info</span>
						</div>
						<div class="w-8 h-0.5 bg-gray-300"></div>
						<div class="flex items-center">
							<div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-irish-orange text-white' : 'bg-gray-300 text-gray-600'}`}>
								2
							</div>
							<span class="ml-2 text-sm">Select Events</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<div class="mx-auto max-w-4xl px-4 py-8">
		{#if success}
			<!-- Success Message -->
			<div class="rounded-lg bg-green-100 border border-green-400 text-green-700 px-6 py-4 text-center">
				<h2 class="text-2xl font-bold mb-2">🎉 Registration Successful!</h2>
				<p class="mb-4">Welcome to Ireland Weekend 2025! You'll receive a confirmation email shortly.</p>
				<p class="text-sm">Redirecting you to the homepage in a few seconds...</p>
			</div>
		{:else if currentStep === 1}
			<!-- Step 1: Personal Information -->
			<div class="bg-white rounded-lg shadow-md p-6">
				<form on:submit|preventDefault={handleStep1Submit} class="space-y-6">
					<!-- Personal Information -->
					<div>
						<h2 class="text-2xl font-bold text-irish-navy mb-4">Personal Information</h2>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="firstName" class="block text-sm font-medium text-irish-navy mb-1">
									First Name *
								</label>
								<input
									type="text"
									id="firstName"
									bind:value={formData.firstName}
									required
									class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
									placeholder="Enter your first name"
								/>
							</div>

							<div>
								<label for="lastName" class="block text-sm font-medium text-irish-navy mb-1">
									Last Name *
								</label>
								<input
									type="text"
									id="lastName"
									bind:value={formData.lastName}
									required
									class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
									placeholder="Enter your last name"
								/>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div>
								<label for="email" class="block text-sm font-medium text-irish-navy mb-1">
									Email Address
								</label>
								<input
									type="email"
									id="email"
									bind:value={formData.email}
									class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
									placeholder="your.email@example.com"
								/>
							</div>

							<div>
								<label for="phone" class="block text-sm font-medium text-irish-navy mb-1">
									Phone Number
								</label>
								<input
									type="tel"
									id="phone"
									bind:value={formData.phone}
									class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
									placeholder="+353 1 234 5678"
								/>
							</div>
						</div>

						<div class="mt-4">
							<label for="countryId" class="block text-sm font-medium text-irish-navy mb-1">
								Country
							</label>
							<select
								id="countryId"
								bind:value={formData.countryId}
								class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
							>
								<option value="">Select your country</option>
								{#each countries as country}
									<option value={country}>{country}</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- Accommodation -->
					<div>
						<h2 class="text-2xl font-bold text-irish-navy mb-4">Accommodation</h2>
						
						<div>
							<label for="accommodationId" class="block text-sm font-medium text-irish-navy mb-1">
								Preferred Accommodation
							</label>
							<select
								id="accommodationId"
								bind:value={formData.accommodationId}
								class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
							>
								<option value="">I'll arrange my own accommodation</option>
								{#each accommodations as accommodation}
									<option value={accommodation.id}>{accommodation.name}</option>
								{/each}
							</select>
							<p class="text-sm text-gray-600 mt-1">
								Choose from our partner accommodations or arrange your own
							</p>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<div>
								<label for="arrivalDate" class="block text-sm font-medium text-irish-navy mb-1">
									Arrival Date
								</label>
								<input
									type="date"
									id="arrivalDate"
									bind:value={formData.arrivalDate}
									class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
								/>
							</div>

							<div>
								<label for="departureDate" class="block text-sm font-medium text-irish-navy mb-1">
									Departure Date
								</label>
								<input
									type="date"
									id="departureDate"
									bind:value={formData.departureDate}
									class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
								/>
							</div>
						</div>
					</div>

					<!-- Additional Information -->
					<div>
						<h2 class="text-2xl font-bold text-irish-navy mb-4">Additional Information</h2>
						
						<div>
							<label for="specialRequests" class="block text-sm font-medium text-irish-navy mb-1">
								Special Requests or Dietary Requirements
							</label>
							<textarea
								id="specialRequests"
								bind:value={formData.specialRequests}
								rows="4"
								class="w-full rounded-lg border border-irish-stone px-3 py-2 focus:outline-none focus:ring-2 focus:ring-irish-green"
								placeholder="Any dietary requirements, accessibility needs, or special requests..."
							></textarea>
						</div>

						<div class="mt-4">
							<label class="flex items-center">
								<input
									type="checkbox"
									bind:checked={formData.isAdult}
									class="rounded border-irish-stone text-irish-green focus:ring-irish-green"
								/>
								<span class="ml-2 text-sm text-irish-navy">
									Are you an adult?
								</span>
							</label>
						</div>
					</div>

					<!-- Error Message -->
					{#if error}
						<div class="rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3">
							<p>{error}</p>
						</div>
					{/if}

					<!-- Submit Button -->
					<div class="pt-4">
						<button
							type="submit"
							disabled={loading}
							class="w-full rounded-lg bg-irish-green px-6 py-3 text-white font-medium transition-colors hover:bg-irish-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{#if loading}
								Creating Account...
							{:else}
								Continue to Event Selection
							{/if}
						</button>
					</div>

					<!-- Terms and Privacy -->
					<div class="text-center text-sm text-gray-600">
						<p>
							By registering, you agree to receive event updates and information about Ireland Weekend 2025.
							<br>
							Your information will only be used for event-related communications.
						</p>
					</div>
				</form>
			</div>
		{:else if currentStep === 2}
			<!-- Step 2: Event Selection -->
			<div class="bg-white rounded-lg shadow-md p-6">
				<div class="mb-6">
					<h2 class="text-2xl font-bold text-irish-navy mb-2">Select Your Events</h2>
					<p class="text-gray-600">Choose which Ireland Weekend events you'd like to attend. You can always modify your selection later.</p>
				</div>

				<!-- Events Grid -->
				{#if events.length === 0}
					<div class="text-center py-8">
						<p class="text-gray-500">Loading events...</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
						{#each events as event}
							<div 
								class={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
									selectedEvents.has(event.id) 
										? 'border-irish-green bg-irish-green' 
										: 'border-irish-stone hover:border-irish-green bg-white'
								}`}
								on:click={() => toggleEventSelection(event.id)}
								on:keydown={(e) => e.key === 'Enter' && toggleEventSelection(event.id)}
								tabindex="0"
								role="button"
								aria-pressed={selectedEvents.has(event.id)}
							>
								<!-- Event Image -->
								{#if event.imageUrl}
									<img 
										src={event.imageUrl} 
										alt={event.title} 
										class="w-full h-32 object-cover"
									/>
								{:else}
									<div class="w-full h-32 bg-irish-stone-light irish-pattern flex items-center justify-center">
										<span class={`text-lg font-bold ${selectedEvents.has(event.id) ? 'text-white' : 'text-irish-navy'}`}>
											{event.title}
										</span>
									</div>
								{/if}

								<div class="p-4">
									<!-- Event Card Header -->
									<div class="flex items-start justify-between mb-3">
										<h3 class={`font-bold leading-tight ${
											selectedEvents.has(event.id) ? 'text-white' : 'text-irish-navy'
										}`}>
											{event.title}
										</h3>
										<div class={`w-5 h-5 rounded border-2 flex items-center justify-center ${
											selectedEvents.has(event.id) 
												? 'bg-white border-white' 
												: 'border-gray-300'
										}`}>
											{#if selectedEvents.has(event.id)}
												<svg class="w-3 h-3 text-irish-green" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
												</svg>
											{/if}
										</div>
									</div>

									<!-- Event Details -->
									<div class="space-y-2 text-sm">
										<div class="flex items-center">
											<span class="font-medium">📅</span>
											<span class={`ml-2 ${selectedEvents.has(event.id) ? 'text-white' : 'text-gray-600'}`}>
												{new Date(event.date).toLocaleDateString('en-US', {
													weekday: 'short',
													month: 'short',
													day: 'numeric'
												})}
											</span>
										</div>
										
										<div class="flex items-center">
											<span class="font-medium">🕐</span>
											<span class={`ml-2 ${selectedEvents.has(event.id) ? 'text-white' : 'text-gray-600'}`}>
												{event.startTime} - {event.endTime}
											</span>
										</div>
										
										{#if event.location}
											<div class="flex items-center">
												<span class="font-medium">📍</span>
												<span class={`ml-2 ${selectedEvents.has(event.id) ? 'text-white' : 'text-gray-600'}`}>
													{event.location}
												</span>
											</div>
										{/if}
									</div>

									<!-- Event Description -->
									{#if event.description}
										<p class={`mt-3 text-sm line-clamp-2 ${
											selectedEvents.has(event.id) ? 'text-white text-opacity-90' : 'text-gray-700'
										}`}>
											{event.description}
										</p>
									{/if}

									<!-- Event Status -->
									{#if event.status}
										<div class="mt-3">
											<span class={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
												selectedEvents.has(event.id) 
													? 'bg-white bg-opacity-20 text-white' 
													: event.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 
													  event.status === 'Tentative' ? 'bg-yellow-100 text-yellow-800' : 
													  'bg-gray-100 text-gray-800'
											}`}>
												{event.status}
											</span>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Selection Summary -->
				<div class="bg-irish-stone-light rounded-lg p-4 mb-6">
					<h3 class="font-medium text-irish-navy mb-2">Your Selection</h3>
					{#if selectedEvents.size === 0}
						<p class="text-sm text-gray-600">No events selected yet. Choose events above to add them to your schedule.</p>
					{:else}
						<p class="text-sm text-gray-600 mb-2">
							You've selected {selectedEvents.size} event{selectedEvents.size === 1 ? '' : 's'}:
						</p>
						<div class="flex flex-wrap gap-2">
							{#each Array.from(selectedEvents) as eventId}
								{@const event = events.find(e => e.id === eventId)}
								{#if event}
									<span class="inline-block bg-irish-green text-white px-3 py-1 rounded-full text-sm">
										{event.title}
									</span>
								{/if}
							{/each}
						</div>
					{/if}
				</div>

				<!-- Error Message -->
				{#if error}
					<div class="rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
						<p>{error}</p>
					</div>
				{/if}

				<!-- Navigation Buttons -->
				<div class="flex gap-4">
					<button
						type="button"
						on:click={goBackToStep1}
						class="flex-1 rounded-lg border border-irish-navy text-irish-navy px-6 py-3 font-medium transition-colors hover:bg-irish-navy hover:text-white"
					>
						← Back to Personal Info
					</button>
					
					<button
						type="button"
						on:click={handleStep2Submit}
						disabled={loading}
						class="flex-1 rounded-lg bg-irish-green px-6 py-3 text-white font-medium transition-colors hover:bg-irish-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if loading}
							Completing Registration...
						{:else}
							Complete Registration
						{/if}
					</button>
				</div>

				<!-- Optional Skip -->
				<div class="text-center mt-4">
					<button
						type="button"
						on:click={handleStep2Submit}
						class="text-sm text-gray-600 hover:text-irish-navy underline"
					>
						Skip event selection for now
					</button>
				</div>
			</div>
		{/if}

		<!-- Additional Information -->
		{#if !success}
			<div class="mt-8 bg-white rounded-lg shadow-md p-6">
				<h2 class="text-2xl font-bold text-irish-navy mb-4">What's Included</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h3 class="font-semibold text-irish-navy mb-2">🎵 Events & Entertainment</h3>
						<p class="text-gray-700 text-sm">Access to all Ireland Weekend events, concerts, and cultural activities</p>
					</div>
					<div>
						<h3 class="font-semibold text-irish-navy mb-2">🍽️ Food & Drink</h3>
						<p class="text-gray-700 text-sm">Traditional Irish meals and beverages at select events</p>
					</div>
					<div>
						<h3 class="font-semibold text-irish-navy mb-2">🎁 Welcome Package</h3>
						<p class="text-gray-700 text-sm">Event merchandise and information pack</p>
					</div>
					<div>
						<h3 class="font-semibold text-irish-navy mb-2">🤝 Community</h3>
						<p class="text-gray-700 text-sm">Connect with fellow Irish culture enthusiasts from around the world</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>