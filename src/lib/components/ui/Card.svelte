<script lang="ts">
	export let title: string = '';
	export let padding: 'sm' | 'md' | 'lg' = 'md';

	const paddings = {
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};

	$: cardClasses = `rounded-lg bg-white shadow ${paddings[padding]}`;
</script>

<div class={cardClasses}>
	{#if title}
		<h2 class="mb-4 text-xl font-bold text-irish-navy">{title}</h2>
	{/if}
	<slot />
</div>