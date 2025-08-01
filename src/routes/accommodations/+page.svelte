<script lang="ts">
	import { onMount } from 'svelte';

	let accommodations = [];
	let loading = true;

	// User filtering
	let userName = '';
	let selectedUser = null;
	let userSearchResults = [];
	let userSearchLoading = false;
	let showUserDropdown = false;
	let allAttendeeNames = [];
	let nameSuggestions = [];
	let showSuggestions = false;

	onMount(async () => {
		try {
			const [accommodationsResponse, namesResponse] = await Promise.all([
				fetch('/api/public/accommodations'),
				fetch('/api/public/attendees/names')
			]);

			accommodations = await accommodationsResponse.json();
			const namesData = await namesResponse.json();
			allAttendeeNames = namesData.names || [];

			loading = false;
		} catch (error) {
			console.error('Failed to load data', error);
			loading = false;
		}
	});

	$: filteredAccommodations = accommodations;

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

		nameSuggestions = suggestions;
		showSuggestions = suggestions.length > 0 && !selectedUser;
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

	// Select a user and load their accommodation
	function selectUser(user) {
		selectedUser = user;
		userName = `${user.firstName} ${user.lastName}`;
		showUserDropdown = false;
		showSuggestions = false;
	}

	// Clear user selection
	function clearUserSelection() {
		selectedUser = null;
		userName = '';
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

	// Debounce user search
	let searchTimeout;
</script>

<div class="bg-irish-stone-light pb-16">
	<!-- Hero Section -->
	<div class="bg-irish-navy px-4 py-12 text-white">
		<div class="mx-auto max-w-6xl text-center">
			<h1 class="mb-4 text-4xl font-bold">Accommodations</h1>
			<p class="mb-6 text-lg">Find the perfect place to stay during Ireland Weekend 2025</p>

			<div class="mx-auto max-w-2xl">
				<!-- User Search Only -->
				<div class="text-center">
					<div class="mb-4">
						<h3 class="text-xl font-medium text-white">Find Someone's Accommodation</h3>
					</div>
					<div class="relative">
						<div class="flex gap-2">
							<div class="relative flex-1">
								<input
									type="text"
									bind:value={userName}
									on:input={() => {
										// Clear user selection if text is changed after selection
										if (selectedUser) {
											clearUserSelection();
										}
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
									placeholder="Enter someone's name to see where they're staying..."
									class="w-full rounded-lg border-2 border-white bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-irish-green focus:ring-2 focus:ring-irish-green focus:outline-none"
								/>

								{#if userSearchLoading}
									<div class="absolute top-1/2 right-3 -translate-y-1/2 transform">
										<div
											class="h-4 w-4 animate-spin rounded-full border-2 border-irish-green border-t-transparent"
										></div>
									</div>
								{/if}

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
													{#if user.accommodationId && user.accommodationName}
														🏨 {user.accommodationName}
														{#if user.accommodationLocation}
															- Room: {user.accommodationLocation}
														{/if}
													{:else}
														No accommodation yet
													{/if}
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
							<div class="bg-opacity-20 mt-2 rounded-lg bg-irish-green p-4 text-sm">
								<div class="mb-2 font-medium text-white">
									📋 Accommodation Details for: {selectedUser.firstName}
									{selectedUser.lastName}
								</div>
								<div class="space-y-1 text-white">
									{#if selectedUser.accommodationId && selectedUser.accommodationName}
										<div class="flex items-start gap-2">
											<span class="font-medium">🏨 Hotel:</span>
											<span>{selectedUser.accommodationName}</span>
										</div>
										{#if selectedUser.accommodationAddress}
											<div class="flex items-start gap-2">
												<span class="font-medium">📍 Address:</span>
												<span>{selectedUser.accommodationAddress}</span>
											</div>
										{/if}
										{#if selectedUser.accommodationLocation}
											<div class="flex items-start gap-2">
												<span class="font-medium">🚪 Room/Location:</span>
												<span>{selectedUser.accommodationLocation}</span>
											</div>
										{/if}
										{#if selectedUser.accommodationCapacity}
											<div class="flex items-start gap-2">
												<span class="font-medium">👥 Capacity:</span>
												<span>{selectedUser.accommodationCapacity}</span>
											</div>
										{/if}
									{:else}
										<div class="text-opacity-80 text-white">No accommodation booked yet</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- User Accommodation Details Section -->
{#if selectedUser}
	<div class="mx-auto max-w-4xl px-4 py-4">
		<div class="rounded-lg border-l-4 border-irish-green bg-white p-6 shadow-lg">
			<h2 class="mb-4 text-2xl font-bold text-irish-navy">
				🏨 Accommodation Details for {selectedUser.firstName}
				{selectedUser.lastName}
			</h2>

			{#if selectedUser.accommodationId && selectedUser.accommodationName}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div class="space-y-4">
						<div>
							<h3 class="mb-2 font-semibold text-irish-navy">Hotel Information</h3>
							<div class="space-y-2">
								<div class="flex items-start gap-2">
									<span class="font-medium text-gray-600">🏨 Name:</span>
									<span class="text-gray-800">{selectedUser.accommodationName}</span>
								</div>
								{#if selectedUser.accommodationAddress}
									<div class="flex items-start gap-2">
										<span class="font-medium text-gray-600">📍 Address:</span>
										<span class="text-gray-800">{selectedUser.accommodationAddress}</span>
									</div>
								{/if}
								{#if selectedUser.accommodationCapacity}
									<div class="flex items-start gap-2">
										<span class="font-medium text-gray-600">👥 Capacity:</span>
										<span class="text-gray-800">{selectedUser.accommodationCapacity}</span>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<h3 class="mb-2 font-semibold text-irish-navy">Personal Details</h3>
							<div class="space-y-2">
								{#if selectedUser.accommodationLocation}
									<div class="flex items-start gap-2">
										<span class="font-medium text-gray-600">🚪 Room/Location:</span>
										<span class="font-medium text-gray-800 text-irish-green"
											>{selectedUser.accommodationLocation}</span
										>
									</div>
								{/if}
								{#if selectedUser.email}
									<div class="flex items-start gap-2">
										<span class="font-medium text-gray-600">📧 Email:</span>
										<span class="text-gray-800">{selectedUser.email}</span>
									</div>
								{/if}
							</div>
						</div>

						<div class="pt-4">
							{#if selectedUser.accommodationAddress}
								<a
									href={`https://maps.google.com/?q=${encodeURIComponent(selectedUser.accommodationAddress)}`}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-2 rounded-lg bg-irish-green px-4 py-2 text-white transition-colors hover:bg-irish-green-dark"
								>
									📍 View on Map
								</a>
							{/if}
						</div>
					</div>
				</div>
			{:else}
				<div class="py-8 text-center">
					<div class="mb-4 text-6xl">🏠</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-600">No Accommodation Booked</h3>
					<p class="text-gray-500">
						{selectedUser.firstName}
						{selectedUser.lastName} hasn't booked accommodation through our system yet.
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Accommodations Section -->
<div class="mx-auto max-w-6xl px-4 py-4">
	{#if loading}
		<div class="py-8 text-center">
			<p class="text-irish-navy-light">Loading accommodations...</p>
		</div>
	{:else if accommodations.length === 0}
		<div class="rounded-lg bg-white py-8 text-center shadow">
			<h2 class="mb-4 text-2xl font-bold text-irish-navy">Coming Soon!</h2>
			<p class="text-irish-navy">Accommodation information will be available soon.</p>
			<p class="mt-2 text-sm text-gray-600">
				Check back later for updates on available places to stay.
			</p>
		</div>
	{:else if filteredAccommodations.length === 0}
		<div class="rounded-lg bg-white py-8 text-center shadow">
			<p class="text-irish-navy">No accommodations available.</p>
		</div>
	{:else}
		<!-- Accommodations Grid -->
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredAccommodations as accommodation}
				<div
					class="overflow-hidden rounded-lg border border-irish-stone bg-white shadow-md transition-all hover:border-irish-green hover:shadow-lg"
				>
					<!-- Accommodation Image -->
					{#if accommodation.notes}
						<img
							src={accommodation.notes}
							alt={accommodation.name}
							class="h-48 w-full object-cover"
						/>
					{:else}
						<div
							class="irish-pattern flex h-32 w-full items-center justify-center bg-irish-stone-light"
						>
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
