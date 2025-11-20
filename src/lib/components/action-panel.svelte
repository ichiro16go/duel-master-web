<script lang="ts">
	import type { GameState } from '$lib/types/game';
	import { TurnPhase } from '$lib/types/turn';

	interface Props {
		gameState: GameState;
		onAction?: (action: string, payload?: any) => void;
	}

	let { gameState, onAction } = $props();

	const isCurrentPlayer = gameState.currentPlayerIndex === 0;

	function canPlayCard(): boolean {
		return isCurrentPlayer && gameState.phase === TurnPhase.MAIN;
	}

	function canAttack(): boolean {
		return isCurrentPlayer && gameState.phase === TurnPhase.ATTACK;
	}

	function canEndTurn(): boolean {
		return isCurrentPlayer;
	}
</script>

<div class="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
	<div class="mx-auto max-w-6xl px-4 py-4">
		<!-- ターンフェーズガイド -->
		<div class="mb-4 flex items-center justify-between">
			<div class="text-sm font-semibold text-muted-foreground">
				現在のフェーズ: <span class="text-foreground">{gameState.phase}</span>
			</div>
			<div class="flex items-center gap-2">
				{#if !isCurrentPlayer}
					<div class="rounded-lg bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
						相手のターンを待機中...
					</div>
				{/if}
			</div>
		</div>

		<!-- アクションボタン -->
		<div class="flex flex-wrap gap-3">
			<!-- カードプレイボタン -->
			<button
				class={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
					canPlayCard()
						? 'bg-primary text-primary-foreground hover:bg-primary/90'
						: 'bg-muted text-muted-foreground cursor-not-allowed'
				}`}
				disabled={!canPlayCard()}
				onclick={() => onAction?.('playCard')}
			>
				カードをプレイ
			</button>

			<!-- 攻撃ボタン -->
			<button
				class={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
					canAttack()
						? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
						: 'bg-muted text-muted-foreground cursor-not-allowed'
				}`}
				disabled={!canAttack()}
				onclick={() => onAction?.('attack')}
			>
				攻撃する
			</button>

			<!-- スタック/割り込み -->
			<button
				class={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
					isCurrentPlayer
						? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
						: 'bg-muted text-muted-foreground cursor-not-allowed'
				}`}
				disabled={!isCurrentPlayer}
				onclick={() => onAction?.('interrupt')}
			>
				割り込む
			</button>

			<div class="flex-1"></div>

			<!-- パス/ターン終了ボタン -->
			<button
				class={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
					canEndTurn()
						? 'bg-accent text-accent-foreground hover:bg-accent/90'
						: 'bg-muted text-muted-foreground cursor-not-allowed'
				}`}
				disabled={!canEndTurn()}
				onclick={() => onAction?.('nextPhase')}
			>
				{gameState.phase === TurnPhase.END ? 'ターン終了' : 'フェーズスキップ'}
			</button>
		</div>

		<!-- 手札とマナ情報 -->
		<div class="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
			<div class="flex gap-4">
				<div class="text-muted-foreground">
					手札: <span class="font-semibold text-foreground">{gameState.players[0].zones.hand.length}</span>
				</div>
				<div class="text-muted-foreground">
					マナ: <span class="font-semibold text-primary">{gameState.players[0].mana}</span> /
					<span class="text-muted-foreground">{gameState.players[0].maxMana}</span>
				</div>
				<div class="text-muted-foreground">
					ライフ: <span class="font-semibold text-success">{gameState.players[0].life}</span> /
					<span class="text-muted-foreground">{gameState.players[0].maxLife}</span>
				</div>
			</div>

			<button
				class="rounded-lg bg-muted px-3 py-1 text-xs hover:bg-muted/80"
				onclick={() => onAction?.('undo')}
			>
				戻す
			</button>
		</div>
	</div>
</div>
