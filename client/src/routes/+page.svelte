<script lang="ts">
	import { onMount } from 'svelte';
	import PixiGameBoard from '$lib/components/pixi-game-board.svelte';
	import ActionPanel from '$lib/components/action-panel.svelte';
	import GameLog from '$lib/components/game-log.svelte';
	import { initializeGame } from '$lib/utils/game-reducer';
    // 🔽 追加: phase-manager と turn-phase-engine から必要な関数をインポート
	import { advancePhase } from '$lib/utils/phase-manager';
	import { initializeTurnState } from '$lib/utils/turn-phase-engine';
	
	import type { GameState } from '$lib/types/game';
	import type { TurnState } from '$lib/types/turn'; 

	let isGameOver = $state<boolean>(false);
	let winnerName = $state<string>('');

	let gameState = $state<GameState>(initializeGame());
    // 🔽 追加: ターン状態も管理する必要があります
    let turnState = $state<TurnState>(initializeTurnState(1, 0));

	let logs = $state<any[]>([]);
	let selectedCard = $state<string | null>(null);

	onMount(() => {
		console.log('[v0] Game initialized:', gameState);
		addLog('ゲーム開始', 'info');
        // ゲーム開始時に最初のフェーズ（START）を実行
        processPhase(); 
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

    // 🔽 新規作成: フェーズごとの自動処理を実行する関数
    function processPhase() {
		if(isGameOver) return;
        // 現在のフェーズのロジックを実行（例：DRAWならカードを引く）
        // ⚠️注意: 現状の関数シグネチャに合わせていますが、本来はプレイヤーごとのカードリストを渡す必要があります
        // ここでは簡易的に全カードリストを結合して渡していますが、実運用では管理方法を見直す必要があります
        const allCards = [...gameState.players[0].zones.deck, ...gameState.players[0].zones.hand, ...gameState.players[0].zones.manaZone, ...gameState.players[0].zones.battleZone, ...gameState.players[0].zones.shieldZone, ...gameState.players[0].zones.graveyard,
                          ...gameState.players[1].zones.deck, ...gameState.players[1].zones.hand, ...gameState.players[1].zones.manaZone, ...gameState.players[1].zones.battleZone, ...gameState.players[1].zones.shieldZone, ...gameState.players[1].zones.graveyard];

        const result = advancePhase(gameState, turnState, allCards);
        
        // 状態を更新
        gameState = result.gameState;
        turnState = result.turnState;

        // 実行結果をログに出力
        if (result.phaseResult.messages) {
            result.phaseResult.messages.forEach((msg: string) => addLog(msg, 'info'));
        }
        if (result.phaseResult.errors) {
            result.phaseResult.errors.forEach((err: string) => addLog(err, 'error'));
        }

		// ドロー失敗（ライブラリアウト）の判定
        if (!result.phaseResult.success && gameState.currentPhase === 'draw') {
            handleGameOver((gameState.currentPlayerIndex + 1) % 2); // 相手の勝ち
            return;
        }
        
        // シールド切れ等の判定
        // (game-reducer.tsのupdateGameEndState等を使うか、ここで簡易判定)
        if (gameState.isGameOver) {
            handleGameOver(gameState.winnerIndex);
            return;
        }
        // 自動で進むべきフェーズか判定（STARTとDRAWは自動で進むのが一般的）
        const autoNextPhases = ['start', 'draw'];
        if (autoNextPhases.includes(gameState.currentPhase)) {
            setTimeout(() => {
               moveToNextPhase(); // 次のフェーズへ
            }, 1000); // 1秒待ってから進む（演出用）
        }
    }

	function handleGameOver(winnerIndex: number | null) {
        isGameOver = true;
        if (winnerIndex !== null) {
            winnerName = gameState.players[winnerIndex].name;
            addLog(`ゲーム終了！勝者: ${winnerName}`, 'warning');
        }
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
        // (既存のコード...)
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
        // 🔽 修正: 単純な状態変更ではなく、ロジック付きのフェーズ進行を呼び出す
        processPhase();
	}

	function handleCardSelect(cardId: string) {
		selectedCard = selectedCard === cardId ? null : cardId;
		console.log('[v0] Card selected:', cardId);
	}
</script>

<PixiGameBoard {gameState} onAction={handleAction} />
{#if isGameOver}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="rounded-xl border-2 border-accent bg-card p-8 text-center shadow-2xl animate-in zoom-in">
        <h2 class="mb-2 text-4xl font-bold text-accent">GAME SET</h2>
        <p class="mb-6 text-xl text-foreground">
            WINNER: <span class="font-bold text-primary">{winnerName}</span>
        </p>
        <button 
            class="rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90"
            onclick={() => location.reload()}
        >
            もう一度遊ぶ
        </button>
    </div>
</div>
{/if}
<div class="fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-700 p-4">
	<ActionPanel {gameState} onAction={handleAction} />
</div>
<div class="fixed top-4 right-4 max-w-sm max-h-96 overflow-y-auto bg-slate-900/90 border border-slate-700 rounded-lg p-4">
	<GameLog {logs} />
</div>