<script lang="ts">
	import { onMount } from 'svelte';

	let events = [];
	let loading = true;
	let searchTerm = '';
	let selectedDate = '';
	
	// User filtering
	let userName = '';
	let selectedUser = null;
	let userEvents = new Set();
	let userSearchResults = [];
	let userSearchLoading = false;
	let showUserDropdown = false;

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

	// Search for users
	async function searchUsers() {
		if (userName.trim().length < 2) {
			userSearchResults = [];
			showUserDropdown = false;
			return;
		}

		userSearchLoading = true;
		
		try {
			const response = await fetch(`/api/public/attendees/search?name=${encodeURIComponent(userName)}`);
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

	// Select a user and load their events
	function selectUser(user) {
		selectedUser = user;
		userName = `${user.firstName} ${user.lastName}`;
		showUserDropdown = false;
		
		// Create a set of event IDs this user is registered for
		userEvents = new Set(user.events.map(e => e.eventId));
	}

	// Clear user selection
	function clearUserSelection() {
		selectedUser = null;
		userName = '';
		userEvents = new Set();
		userSearchResults = [];
		showUserDropdown = false;
	}

	// Check if user is registered for an event
	function isUserRegistered(eventId) {
		return userEvents.has(eventId);
	}

	// Get user's status for an event
	function getUserEventStatus(eventId) {
		if (!selectedUser) return null;
		const userEvent = selectedUser.events.find(e => e.eventId === eventId);
		return userEvent?.status || null;
	}

	// Debounce user search
	let searchTimeout;
	function handleUserInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(searchUsers, 300);
	}
</script>

<div class="min-h-screen bg-irish-stone-light pb-16">
	<!-- Hero Section -->
	<div class="bg-irish-navy px-4 py-12 text-white">
		<div class="mx-auto max-w-6xl text-center">
			<h1 class="mb-4 text-4xl font-bold">Events Schedule</h1>
			<p class="mb-6 text-lg">Discover all the exciting events planned for our Ireland Weekend</p>

			<div class="mx-auto max-w-4xl">
				<!-- Search and Filter Row -->
				<div class="flex flex-col gap-4 lg:flex-row lg:items-end">
					<!-- Event Search and Date Filter -->
					<div class="flex flex-col gap-3 sm:flex-row lg:flex-1">
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

					<!-- User Filter -->
					<div class="relative lg:w-80">
						<div class="flex gap-2">
							<div class="relative flex-1">
								<input
									type="text"
									bind:value={userName}
									on:input={handleUserInput}
									on:focus={() => userName.length >= 2 && searchUsers()}
									placeholder="Enter your name to see your events..."
									class="w-full rounded-lg border border-irish-stone px-4 py-2 text-irish-navy focus:outline-none focus:ring-2 focus:ring-irish-green"
								/>
								
								{#if userSearchLoading}
									<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
										<div class="w-4 h-4 border-2 border-irish-green border-t-transparent rounded-full animate-spin"></div>
									</div>
								{/if}

								<!-- User Search Dropdown -->
								{#if showUserDropdown && userSearchResults.length > 0}
									<div class="absolute top-full left-0 right-0 mt-1 bg-white border border-irish-stone rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
										{#each userSearchResults as user}
											<button
												type="button"
												on:click={() => selectUser(user)}
												class="w-full text-left px-4 py-3 hover:bg-irish-stone-light border-b border-irish-stone last:border-b-0 text-irish-navy"
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
							
							{#if selectedUser}
								<button
									type="button"
									on:click={clearUserSelection}
									class="px-3 py-2 bg-irish-orange hover:bg-irish-orange-dark rounded-lg transition-colors"
									title="Clear user selection"
								>
									✕
								</button>
							{/if}
						</div>

						<!-- Selected User Info -->
						{#if selectedUser}
							<div class="mt-2 p-3 bg-irish-green bg-opacity-20 rounded-lg text-sm">
								<div class="font-medium">Viewing events for: {selectedUser.firstName} {selectedUser.lastName}</div>
								<div class="text-white text-opacity-80">
									Registered for {selectedUser.events.length} event{selectedUser.events.length === 1 ? '' : 's'}
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
							{@const isRegistered = isUserRegistered(event.id)}
							{@const userStatus = getUserEventStatus(event.id)}
							<div
								class={`overflow-hidden rounded-lg border shadow-md transition-all hover:shadow-lg ${
									selectedUser && !isRegistered 
										? 'border-gray-300 bg-gray-50 opacity-50' 
										: selectedUser && isRegistered
										? 'border-irish-green bg-white ring-2 ring-irish-green ring-opacity-30'
										: 'border-irish-stone bg-white hover:border-irish-green'
								}`}
							>
								<!-- User Registration Status Badge -->
								{#if selectedUser}
									<div class="relative">
										{#if isRegistered}
											<div class="absolute top-2 right-2 z-10">
												<span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													userStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
													userStatus === 'Maybe' ? 'bg-yellow-100 text-yellow-800' :
													userStatus === 'Declined' ? 'bg-red-100 text-red-800' :
													'bg-irish-green text-white'
												}`}>
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
												<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
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
										<span class={`text-xl font-bold ${selectedUser && !isRegistered ? 'text-gray-500' : 'text-irish-navy'}`}>
											{event.title}
										</span>
									</div>
								{/if}

								<div class="p-4">
									<div class="flex items-start justify-between">
										<h3 class={`text-xl font-bold ${selectedUser && !isRegistered ? 'text-gray-500' : 'text-irish-navy'}`}>
											{event.title}
										</h3>
										<div class={`text-sm ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-500'}`}>
											{event.startTime} - {event.endTime}
										</div>
									</div>

									<p class={`mb-3 mt-1 ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-600'}`}>
										<span class="font-medium">Location:</span>
										{event.location || 'TBA'}
									</p>

									<p class={`mb-4 line-clamp-3 ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-700'}`}>
										{event.description}
									</p>

									<div class="flex items-center justify-between">
										<span class={`text-sm ${selectedUser && !isRegistered ? 'text-gray-400' : 'text-gray-500'}`}>
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
