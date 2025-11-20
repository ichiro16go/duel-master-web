<script lang="ts">
	import { onMount } from 'svelte';
	import PixiGameBoard from '$lib/components/pixi-game-board.svelte';
	import ActionPanel from '$lib/components/action-panel.svelte';
	import GameLog from '$lib/components/game-log.svelte';
	import { initializeGame, transitionPhase } from '$lib/utils/game-reducer';
	import type { GameState } from '$lib/types/game';

	let gameState = $state<GameState>(initializeGame());
	let logs = $state<any[]>([]);
	let selectedCard = $state<string | null>(null);

	onMount(() => {
		console.log('[v0] Game initialized:', gameState);
		addLog('ゲーム開始', 'info');
	});

	function addLog(message: string, type: 'info' | 'action' | 'warning' | 'error' = 'info') {
		logs.push({
			id: `${Date.now()}-${Math.random()}`,
			message,
			type,
			timestamp: new Date()
		});
		if (logs.length > 50) logs.shift();
	}

	function handleAction(action: string, payload?: any) {
		console.log('[v0] Action:', action, payload);

		switch (action) {
			case 'playCard':
				if (selectedCard) {
					playCard(selectedCard);
					selectedCard = null;
				} else {
					addLog('カードを選択してください', 'warning');
				}
				break;

			case 'attack':
				addLog('攻撃フェーズへ移行', 'action');
				break;

			case 'interrupt':
				addLog('割り込み可能です', 'info');
				break;

			case 'nextPhase':
				moveToNextPhase();
				break;

			case 'undo':
				addLog('戻す機能は未実装です', 'warning');
				break;
		}
	}

	function playCard(cardId: string) {
		const currentPlayer = gameState.players[gameState.currentPlayerIndex];
		const card = currentPlayer.zones.hand.find(c => c.id === cardId);

		if (!card) return;

		if (card.cost > currentPlayer.mana) {
			addLog(`マナが足りません (必要: ${card.cost}, 保有: ${currentPlayer.mana})`, 'error');
			return;
		}

		const handIndex = currentPlayer.zones.hand.findIndex(c => c.id === cardId);
		currentPlayer.zones.hand.splice(handIndex, 1);
		currentPlayer.zones.battleZone.push(card);

		currentPlayer.mana -= card.cost;

		addLog(`${card.name} をプレイしました`, 'action');
	}

	function moveToNextPhase() {
		gameState = transitionPhase(gameState);

		const phaseNames: Record<string, string> = {
			start: 'スタートフェーズ',
			draw: 'ドローフェーズ',
			main: 'メインフェーズ',
			attack: 'アタックフェーズ',
			end: 'エンドフェーズ'
		};

		addLog(`${phaseNames[gameState.currentPhase] || gameState.currentPhase} に移行`, 'action');
	}

	function handleCardSelect(cardId: string) {
		selectedCard = selectedCard === cardId ? null : cardId;
		console.log('[v0] Card selected:', cardId);
	}
</script>

<PixiGameBoard {gameState} />

<div class="fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-700 p-4">
	<ActionPanel {gameState} onAction={handleAction} />
</div>

<div class="fixed top-4 right-4 max-w-sm max-h-96 overflow-y-auto bg-slate-900/90 border border-slate-700 rounded-lg p-4">
	<GameLog {logs} />
</div>
