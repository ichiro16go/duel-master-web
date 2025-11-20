<script lang="ts">
	import type { GameState } from '$lib/types/game';

	let { gameState } = $props();
</script>

<div class="flex items-center justify-between border-b border-border bg-card/50 px-6 py-4">
	<div class="flex items-center gap-4">
		<h1 class="text-2xl font-bold text-primary">デュエル・マスターズ</h1>
		<div class="text-sm text-muted-foreground">
			ターン: <span class="text-foreground">{gameState.turnCount}</span>
		</div>
	</div>

	<div class="flex items-center gap-6">
		<div class="text-center">
			<div class="text-xs text-muted-foreground">現在のターン</div>
			<div class="text-lg font-semibold text-accent">
				{gameState.currentPlayerIndex === 0 ? 'あなたのターン' : '相手のターン'}
			</div>
		</div>

		<div class="h-8 w-px bg-border"></div>

		<div class="text-center">
			<div class="text-xs text-muted-foreground">フェーズ</div>
			<div class="text-lg font-semibold text-secondary">{gameState.currentPhase}</div>
		</div>
	</div>

	<button
		class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
	>
		メニュー
	</button>
</div>
