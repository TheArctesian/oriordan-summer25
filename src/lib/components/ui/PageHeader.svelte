<script lang="ts">
	export let title: string;
	export let subtitle: string = '';
</script>

<div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
	<div>
		<h1 class="text-3xl font-bold text-irish-navy">{title}</h1>
		{#if subtitle}
			<p class="mt-2 text-gray-600">{subtitle}</p>
		{/if}
	</div>
	<div class="flex flex-col sm:flex-row gap-3">
		<slot />
	</div>
</div>