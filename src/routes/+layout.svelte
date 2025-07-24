<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';

	let { children } = $props();
</script>

{#if $page.url.pathname.startsWith('/admin')}
	<!-- Admin Layout -->
	<div class="bg-irish-stone-light min-h-screen">
		<div class="flex flex-col md:flex-row">
			<!-- Sidebar for desktop -->
			<aside class="bg-irish-navy w-full md:fixed md:min-h-screen md:w-64">
				<div class="p-4 text-white">
					<h2 class="text-irish-orange mb-6 text-2xl font-bold">Ireland Weekend</h2>
					<nav>
						<ul class="space-y-2">
							{#each [{ href: '/admin', label: 'Dashboard' }, { href: '/admin/attendees', label: 'Attendees' }, { href: '/admin/events', label: 'Events' }, { href: '/admin/accommodations', label: 'Accommodations' }, { href: '/admin/event-attendance', label: 'Event Attendance' }] as item}
								<li>
									<a
										href={item.href}
										class="block rounded px-4 py-2 transition-colors {$page.url.pathname ===
										item.href
											? 'bg-irish-green text-white'
											: 'text-irish-stone hover:bg-irish-navy-light'}"
									>
										{item.label}
									</a>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
			</aside>

			<!-- Main content -->
			<main class="w-full flex-1 p-4 md:ml-64 md:p-8">
				<div class="rounded-lg bg-white p-4 shadow md:p-6">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{:else}
	<!-- Public Layout -->
	<div class="bg-irish-stone-light min-h-screen">
		<!-- Navbar -->
		<nav class="bg-irish-navy p-4 text-white shadow-md">
			<div class="container mx-auto flex items-center justify-between">
				<a href="/" class="text-irish-orange text-xl font-bold">Ireland Weekend 2025</a>
				<div class="space-x-4">
					<a href="/events" class="hover:text-irish-green transition-colors">Events</a>
					<a href="/accommodations" class="hover:text-irish-green transition-colors"
						>Accommodations</a
					>
					<a
						href="/register"
						class="bg-irish-orange hover:bg-irish-orange-dark rounded px-4 py-2 transition-colors"
						>Register</a
					>
				</div>
			</div>
		</nav>

		<!-- Main content -->
		<main>
			{@render children()}
		</main>

		<!-- Footer -->
		<footer class="bg-irish-navy mt-12 p-6 text-white">
			<div class="container mx-auto">
				<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
					<div>
						<h3 class="text-irish-orange mb-4 text-lg font-bold">Ireland Weekend 2025</h3>
						<p>Join us for a special weekend in Ireland, celebrating with friends and family.</p>
					</div>
					<div>
						<h3 class="text-irish-orange mb-4 text-lg font-bold">Quick Links</h3>
						<ul class="space-y-2">
							<li><a href="/" class="hover:text-irish-green transition-colors">Home</a></li>
							<li><a href="/events" class="hover:text-irish-green transition-colors">Events</a></li>
							<li>
								<a href="/accommodations" class="hover:text-irish-green transition-colors"
									>Accommodations</a
								>
							</li>
							<li>
								<a href="/register" class="hover:text-irish-green transition-colors">Register</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 class="text-irish-orange mb-4 text-lg font-bold">Contact</h3>
						<p>For any queries about the weekend, please contact us:</p>
						<p class="mt-2">Email: info@irelandweekend.com</p>
					</div>
				</div>
				<div class="mt-8 border-t border-gray-700 pt-6 text-center">
					<p>&copy; 2025 Ireland Weekend. All rights reserved.</p>
				</div>
			</div>
		</footer>
	</div>
{/if}
