<script lang="ts">
	import type { PlayerState } from '$lib/types/game';
	import CardDisplay from './card-display.svelte';

	interface Props {
		player: PlayerState;
		onCardSelect?: (cardId: string) => void;
	}

	let { player, onCardSelect } = $props();

	let expandedCardId = $state<string | null>(null);
</script>

<div class="zone-container">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-sm font-semibold text-foreground">手札</h3>
		<span class="text-xs text-muted-foreground">{player.zones.hand.length} 枚</span>
	</div>

	<div class="flex flex-wrap gap-2">
		{#if player.zones.hand.length === 0}
			<div class="flex h-24 w-full items-center justify-center text-muted-foreground">
				手札はありません
			</div>
		{:else}
			{#each player.zones.hand as card (card.id)}
				<div
					class="group relative"
					role="button"
					tabindex="0"
					onmouseenter={() => (expandedCardId = card.id)}
					onmouseleave={() => (expandedCardId = null)}
				>
					<CardDisplay
						{card}
						isSmall={true}
						showDetails={expandedCardId === card.id}
						onclick={() => onCardSelect?.(card.id)}
					/>

					<!-- Updated to Svelte 5 syntax - removed on: prefix -->
					<!-- カード詳細展開 -->
					{#if expandedCardId === card.id}
						<div
							class="absolute bottom-full left-0 z-10 mb-2 rounded-lg border-2 border-primary bg-card p-3 shadow-lg"
						>
							<div class="w-32">
								<div class="mb-1 text-xs font-bold text-primary">{card.type}</div>
								<div class="mb-2 text-xs font-semibold text-foreground">{card.name}</div>
								<div class="flex justify-between text-xs">
									<span class="text-muted-foreground">パワー:</span>
									<span class="text-accent">{card.power || '-'}</span>
								</div>
								<div class="flex justify-between text-xs">
									<span class="text-muted-foreground">マナ:</span>
									<span class="text-accent">{card.manaCost}</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>
