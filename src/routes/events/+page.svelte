<script lang="ts">
	import { onMount } from 'svelte';

	let events = [];
	let loading = true;

	// User filtering
	let userName = '';
	let selectedUser = null;
	let userEvents = new Set();
	let userSearchResults = [];
	let userSearchLoading = false;
	let showUserDropdown = false;
	let allAttendeeNames = [];
	let nameSuggestions = [];
	let showSuggestions = false;

	onMount(async () => {
		try {
			const [eventsResponse, namesResponse] = await Promise.all([
				fetch('/api/public/events'),
				fetch('/api/public/attendees/names')
			]);

			events = await eventsResponse.json();
			const namesData = await namesResponse.json();
			allAttendeeNames = namesData.names || [];

			loading = false;
		} catch (error) {
			console.error('Failed to load data', error);
			loading = false;
		}
	});

	$: filteredEvents = events;

	// Search for users
	async function searchUsers() {
		if (userName.trim().length < 2) {
			userSearchResults = [];
			showUserDropdown = false;
			return;
		}

		userSearchLoading = true;

		try {
			const response = await fetch(
				`/api/public/attendees/search?name=${encodeURIComponent(userName)}`
			);
			const data = await response.json();

			if (data.attendees) {
				userSearchResults = data.attendees;
				showUserDropdown = userSearchResults.length > 0;
			}
		} catch (error) {
			console.error('Failed to search users:', error);
			userSearchResults = [];
			showUserDropdown = false;
		} finally {
			userSearchLoading = false;
		}
	}

	// Generate name suggestions based on input
	function generateNameSuggestions() {
		console.log(
			'generateNameSuggestions called, userName:',
			userName,
			'allAttendeeNames:',
			allAttendeeNames.length
		);

		if (userName.trim().length < 2) {
			nameSuggestions = [];
			showSuggestions = false;
			return;
		}

		const searchTerm = userName.trim().toLowerCase();

		// Find names that are similar to the input
		const suggestions = allAttendeeNames
			.filter((person) => {
				// Handle null/undefined values
				const fullName = (person.fullName || '').toLowerCase();
				const firstName = (person.firstName || '').toLowerCase();
				const lastName = (person.lastName || '').toLowerCase();

				// Skip if all names are empty
				if (!fullName && !firstName && !lastName) return false;

				return (
					fullName.includes(searchTerm) ||
					firstName.includes(searchTerm) ||
					lastName.includes(searchTerm) ||
					// Fuzzy matching for typos
					isCloseMatch(fullName, searchTerm) ||
					isCloseMatch(firstName, searchTerm) ||
					isCloseMatch(lastName, searchTerm)
				);
			})
			.slice(0, 5); // Limit to 5 suggestions

		console.log('suggestions found:', suggestions.length, suggestions);
		console.log('selectedUser:', selectedUser, 'showUserDropdown:', showUserDropdown);
		nameSuggestions = suggestions;
		showSuggestions = suggestions.length > 0 && !selectedUser;
		console.log('showSuggestions:', showSuggestions);
	}

	// Simple fuzzy matching for typos
	function isCloseMatch(str1, str2) {
		if (Math.abs(str1.length - str2.length) > 2) return false;

		let differences = 0;
		const maxLength = Math.max(str1.length, str2.length);

		for (let i = 0; i < maxLength; i++) {
			if (str1[i] !== str2[i]) differences++;
			if (differences > 2) return false;
		}

		return differences <= 2;
	}

	// Execute search manually
	function executeUserSearch() {
		showSuggestions = false;
		searchUsers();
	}

	// Select a user and load their events
	function selectUser(user) {
		selectedUser = user;
		userName = `${user.firstName} ${user.lastName}`;
		showUserDropdown = false;
		showSuggestions = false;

		// Create a set of event IDs this user is registered for (ensure consistent data types)
		console.log('User events:', user.events);
		userEvents = new Set(user.events.map((e) => Number(e.eventId)));
		console.log('User event IDs:', userEvents);
	}

	// Clear user selection
	function clearUserSelection() {
		selectedUser = null;
		userName = '';
		userEvents = new Set();
		userSearchResults = [];
		showUserDropdown = false;
		nameSuggestions = [];
		showSuggestions = false;
	}

	// Select name suggestion
	function selectSuggestion(suggestion) {
		userName = suggestion.fullName;
		showSuggestions = false;
		executeUserSearch();
	}

	// Check if user is registered for an event
	function isUserRegistered(eventId) {
		const numericEventId = Number(eventId);
		const isRegistered = userEvents.has(numericEventId);
		console.log(
			`Event ${eventId} (${typeof eventId}) -> ${numericEventId} (${typeof numericEventId}): registered = ${isRegistered}`,
			userEvents
		);
		return isRegistered;
	}

	// Get user's status for an event
	function getUserEventStatus(eventId) {
		if (!selectedUser) return null;
		const numericEventId = Number(eventId);
		const userEvent = selectedUser.events.find((e) => Number(e.eventId) === numericEventId);
		return userEvent?.status || null;
	}

	// Debounce user search
	let searchTimeout;
</script>

<div class="min-h-screen bg-irish-stone-light pb-16">
	<!-- Hero Section -->
	<div class="bg-irish-navy px-4 py-12 text-white">
		<div class="mx-auto max-w-6xl text-center">
			<h1 class="mb-4 text-4xl font-bold">Events Schedule</h1>
			<p class="mb-6 text-lg">Discover all the exciting events planned for our Ireland Weekend</p>

			<div class="mx-auto max-w-2xl">
				<!-- User Search Only -->
				<div class="text-center">
					<div class="mb-4">
						<h3 class="text-xl font-medium text-white">See Your Personalised Agenda</h3>
					</div>
					<div class="relative mx-auto w-full max-w-lg">
						<div class="flex gap-2">
							<div class="relative flex-1">
								<input
									type="text"
									bind:value={userName}
									on:input={() => {
										generateNameSuggestions();
										clearTimeout(searchTimeout);
										searchTimeout = setTimeout(searchUsers, 300);
									}}
									on:focus={() => {
										if (userName.length >= 2) {
											generateNameSuggestions();
											searchUsers();
										}
									}}
									on:blur={() => {
										// Hide suggestions after a short delay to allow clicks
										setTimeout(() => {
											showSuggestions = false;
										}, 200);
									}}
									placeholder="Enter your name to see your events..."
									class="w-full rounded-lg border-2 border-white bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-irish-green focus:ring-2 focus:ring-irish-green focus:outline-none"
								/>

								{#if userSearchLoading}
									<div class="absolute top-1/2 right-3 -translate-y-1/2 transform">
										<div
											class="h-4 w-4 animate-spin rounded-full border-2 border-irish-green border-t-transparent"
										></div>
									</div>
								{/if}

								<!-- Debug: Show suggestion state 
								{#if userName.length >= 2}
									<div class="absolute top-full left-0 rounded bg-red-500 p-1 text-xs text-white">
										Debug: {nameSuggestions.length} suggestions, showSuggestions: {showSuggestions}
									</div>
								{/if}
                                -->

								<!-- User Search Dropdown -->
								{#if showUserDropdown && userSearchResults.length > 0}
									<div
										class="absolute top-full right-0 left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-irish-stone bg-white shadow-lg"
									>
										{#each userSearchResults as user}
											<button
												type="button"
												on:click={() => selectUser(user)}
												class="w-full border-b border-irish-stone px-4 py-3 text-left text-irish-navy last:border-b-0 hover:bg-irish-stone-light"
											>
												<div class="font-medium">{user.firstName} {user.lastName}</div>
												{#if user.email}
													<div class="text-sm text-gray-600">{user.email}</div>
												{/if}
												<div class="text-xs text-gray-500">
													{user.events.length} event{user.events.length === 1 ? '' : 's'} registered
												</div>
											</button>
										{/each}
									</div>
								{/if}
							</div>

							<!-- Search Button -->
							<button
								type="button"
								on:click={executeUserSearch}
								disabled={userName.length < 2}
								class="rounded-lg bg-irish-green px-4 py-2 font-bold text-white transition-colors hover:bg-irish-green-dark disabled:cursor-not-allowed disabled:bg-gray-400"
								title="Search for user"
							>
								🔍
							</button>

							{#if selectedUser}
								<button
									type="button"
									on:click={clearUserSelection}
									class="rounded-lg bg-irish-orange px-3 py-2 transition-colors hover:bg-irish-orange-dark"
									title="Clear user selection"
								>
									✕
								</button>
							{/if}
						</div>

						<!-- Selected User Info -->
						{#if selectedUser}
							<div class="bg-opacity-20 mt-2 rounded-lg bg-irish-green p-3 text-sm">
								<div class="font-medium">
									Viewing events for: {selectedUser.firstName}
									{selectedUser.lastName}
								</div>
								<div class="text-opacity-80 text-white">
									Registered for {selectedUser.events.length} event{selectedUser.events.length === 1
										? ''
										: 's'}
								</div>
							</div>
						{/if}
					</div>
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
							{@const isRegistered = isUserRegistered(event.id)}
							{@const userStatus = getUserEventStatus(event.id)}
							<div
								class={`overflow-hidden rounded-lg border shadow-md transition-all hover:shadow-lg ${
									selectedUser && !isRegistered
										? 'border-gray-300 bg-gray-50 opacity-50'
										: selectedUser && isRegistered
											? 'ring-opacity-30 border-irish-green bg-white ring-2 ring-irish-green'
											: 'border-irish-stone bg-white hover:border-irish-green'
								}`}
							>
								<!-- User Registration Status Badge -->
								{#if selectedUser}
									<div class="relative">
										{#if isRegistered}
											<div class="absolute top-2 right-2 z-10">
												<span
													class={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
														userStatus === 'Confirmed'
															? 'bg-green-100 text-green-800'
															: userStatus === 'Maybe'
																? 'bg-yellow-100 text-yellow-800'
																: userStatus === 'Declined'
																	? 'bg-red-100 text-red-800'
																	: 'bg-irish-green text-white'
													}`}
												>
													{#if userStatus === 'Confirmed'}
														✓ Going
													{:else if userStatus === 'Maybe'}
														? Maybe
													{:else if userStatus === 'Declined'}
														✗ Not Going
													{:else}
														✓ Registered
													{/if}
												</span>
											</div>
										{:else}
											<div class="absolute top-2 right-2 z-10">
												<span
													class="inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600"
												>
													Not Registered
												</span>
											</div>
										{/if}
									</div>
								{/if}

								{#if event.imageUrl}
									<img
										src={event.imageUrl}
										alt={event.title}
										class={`h-48 w-full object-cover ${selectedUser && !isRegistered ? 'opacity-60' : ''}`}
									/>
								{:else}
									<div
										class={`irish-pattern flex h-32 w-full items-center justify-center bg-irish-stone-light ${selectedUser && !isRegistered ? 'opacity-60' : ''}`}
									>
										<span
											class={`text-xl font-bold ${selectedUser && !isRegistered ? 'text-gray-500' : 'text-irish-navy'}`}
										>
											{event.title}
										</span>
									</div>
								{/if}

								<div class="p-4">
									<div class="flex items-start justify-between">
										<h3
											class={`text-xl font-bold ${selectedUser && !isRegistered ? 'text-gray-500' : 'text-irish-navy'}`}
										>
											{event.title}
										</h3>
										<div
											class={`text-sm ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-500'}`}
										>
											{event.startTime} - {event.endTime}
										</div>
									</div>

									<p
										class={`mt-1 mb-3 ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-600'}`}
									>
										<span class="font-medium">Location:</span>
										{event.location || 'TBA'}
									</p>

									<p
										class={`mb-4 line-clamp-3 ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-700'}`}
									>
										{event.description}
									</p>

									<div class="flex items-center justify-between">
										<span
											class={`text-sm ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-500'}`}
										>
											{#if event.maxAttendees}
												Max Attendees: {event.maxAttendees}
											{/if}
										</span>

										<a
											href={`/events/${event.id}`}
											class={`rounded-lg px-4 py-2 text-white transition-colors ${
												selectedUser && !isRegistered
													? 'bg-gray-400 hover:bg-gray-500'
													: 'bg-irish-green hover:bg-irish-green-dark'
											}`}
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
