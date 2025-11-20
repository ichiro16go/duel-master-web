<script lang="ts">
	import type { PlayerState } from '$lib/types/game';
	import CardDisplay from './card-display.svelte';

	interface Props {
		player: PlayerState;
	}

	let { player } = $props();

	let showGraveyard = $state(false);
</script>

<div class="zone-container">
	<button
		class="mb-3 flex w-full items-center justify-between rounded-lg bg-destructive/10 px-3 py-2 hover:bg-destructive/20"
		onclick={() => (showGraveyard = !showGraveyard)}
	>
		<h3 class="text-sm font-semibold text-destructive">墓地</h3>
		<span class="text-xs text-destructive/70">{player.zones.graveyard.length} 枚</span>
	</button>

	{#if showGraveyard}
		<div class="flex flex-wrap gap-2">
			{#if player.zones.graveyard.length === 0}
				<div class="flex h-24 w-full items-center justify-center text-muted-foreground">
					墓地は空です
				</div>
			{:else}
				{#each player.zones.graveyard as card (card.id)}
					<CardDisplay {card} isSmall={true} />
				{/each}
			{/if}
		</div>
	{/if}
</div>
