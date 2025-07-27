<script lang="ts">
	export let message: string = 'Loading...';
	export let size: 'sm' | 'md' | 'lg' = 'md';

	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8', 
		lg: 'w-12 h-12'
	};
</script>

<div class="py-8 text-center">
	<div class="inline-flex items-center gap-3">
		<div class={`${sizes[size]} animate-spin rounded-full border-2 border-irish-green border-t-transparent`}></div>
		<p class="text-irish-navy-light">{message}</p>
	</div>
</div>