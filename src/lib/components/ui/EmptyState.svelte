<script lang="ts">
	export let title: string;
	export let description: string = '';
	export let actionText: string = '';
	export let actionHref: string = '';
</script>

<div class="rounded-lg bg-irish-stone-light py-8 text-center">
	<p class="text-irish-navy font-medium">{title}</p>
	{#if description}
		<p class="mt-2 text-gray-600 text-sm">{description}</p>
	{/if}
	{#if actionText && actionHref}
		<a
			href={actionHref}
			class="mt-4 inline-block rounded bg-irish-orange px-4 py-2 text-white transition-colors hover:bg-irish-orange-dark"
		>
			{actionText}
		</a>
	{/if}
	<slot />
</div>