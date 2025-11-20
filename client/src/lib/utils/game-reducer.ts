import type { GameState, PlayerState } from "$lib/types/game"
import type { GameCard as Card} from "$lib/types/card"
import { GAME_CONSTANTS } from "$lib/utils/game-constants"
import { TEST_CARDS } from "$lib/data/test-cards"
import { createCardInstance } from "$lib/utils/card-manager"

/**
 * ゲーム状態を初期化
 */
export function initializeGameState(player1: PlayerState, player2: PlayerState): GameState {
  return {
    id: generateGameId(),
    players: [player1, player2],
    currentPlayerIndex: 0,
    currentPhase: GAME_CONSTANTS.TURN_PHASE.START,
    turnCount: 0,
    isGameOver: false,
    winnerIndex: null,
    actionStack: [],
  }
}

/**
 * プレイヤーの初期状態を生成
 */
export function createInitialPlayerState(id: string, name: string, deck: Card[]): PlayerState {
  return {
    id,
    name,
    shields: GAME_CONSTANTS.INITIAL_SHIELDS,
    zones: {
      hand: [],
      deck: shuffleDeck([...deck]),
      graveyard: [],
      manaZone: [],
      battleZone: [],
      shieldZone: [],
    },
    mana: GAME_CONSTANTS.INITIAL_MANA,
    maxMana: GAME_CONSTANTS.INITIAL_MANA,
  }
}

/**
 * ターンフェーズを次のフェーズに進める
 */
export function advanceTurnPhase(gameState: GameState): GameState {
  const phaseOrder = [
    GAME_CONSTANTS.TURN_PHASE.START,
    GAME_CONSTANTS.TURN_PHASE.DRAW,
    GAME_CONSTANTS.TURN_PHASE.MAIN,
    GAME_CONSTANTS.TURN_PHASE.ATTACK,
    GAME_CONSTANTS.TURN_PHASE.END,
  ]

  const currentIndex = phaseOrder.indexOf(gameState.currentPhase)
  const nextIndex = (currentIndex + 1) % phaseOrder.length

  const updatedState = { ...gameState, currentPhase: phaseOrder[nextIndex] }

  // エンドフェーズから次のターンへ遷移
  if (gameState.currentPhase === GAME_CONSTANTS.TURN_PHASE.END) {
    const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % 2
    return {
      ...updatedState,
      currentPlayerIndex: nextPlayerIndex as 0 | 1,
      turnCount: gameState.turnCount + 1,
    }
  }

  return updatedState
}

/**
 * マナを増加させる
 */
export function increaseMana(gameState: GameState, amount = 1): GameState {
  const playerIndex = gameState.currentPlayerIndex
  const updatedPlayers = [...gameState.players]
  const currentPlayer = { ...updatedPlayers[playerIndex] }

  const newMaxMana = Math.min(currentPlayer.maxMana + amount, GAME_CONSTANTS.MAX_MANA_PER_TURN)

  currentPlayer.maxMana = newMaxMana
  currentPlayer.mana = newMaxMana // ターン開始時にマナを全回復

  updatedPlayers[playerIndex] = currentPlayer

  return { ...gameState, players: updatedPlayers as [PlayerState, PlayerState] }
}

/**
 * マナを消費する
 */
export function spendMana(gameState: GameState, amount: number): GameState {
  const playerIndex = gameState.currentPlayerIndex
  const updatedPlayers = [...gameState.players]
  const currentPlayer = { ...updatedPlayers[playerIndex] }

  if (currentPlayer.mana < amount) {
    throw new Error("マナが不足しています")
  }

  currentPlayer.mana -= amount
  updatedPlayers[playerIndex] = currentPlayer

  return { ...gameState, players: updatedPlayers as [PlayerState, PlayerState] }
}

/**
 * ゲーム終了状態を判定
 */
/**
 * ゲーム終了状態を判定（シールド切れ or デッキ切れ）
 */
export function checkGameEnd(gameState: GameState): { isEnded: boolean; winner: 0 | 1 | null } {
  const [player1, player2] = gameState.players

  // シールド切れによる敗北判定
  if (player1.shields < 0) return { isEnded: true, winner: 1 } // player1敗北
  if (player2.shields < 0) return { isEnded: true, winner: 0 } // player2敗北

  // デッキ切れ（ライブラリアウト）による敗北判定
  // 注意: 正確には「引こうとした時」に負けだが、ここでは簡易的に判定
  // 厳密な判定は executeDrawPhase の結果を受け取る必要がある
  
  return { isEnded: false, winner: null }
}
/**
 * 敗北条件をチェックしてゲーム状態を更新
 */
export function updateGameEndState(gameState: GameState): GameState {
  const { isEnded, winner } = checkGameEnd(gameState)

  if (isEnded && winner !== null) {
    return {
      ...gameState,
      isGameOver: true,
      winnerIndex: winner,
    }
  }

  return gameState
}

/**
 * テスト用デッキを生成する
 */
function createTestDeck(ownerId: string): Card[] {
  const deck: Card[] = [];
  // 40枚になるまでテストカードをランダムに追加
  for (let i = 0; i < GAME_CONSTANTS.DECK_SIZE; i++) {
    const template = TEST_CARDS[i % TEST_CARDS.length];
    const instanceId = `${ownerId}_card_${i}_${Date.now()}`;
    // createCardInstanceを使って完全なGameCardオブジェクトを生成
    const card = createCardInstance(template, ownerId, instanceId, 0);
    // 初期状態はデッキ
    card.zone = "in-deck";
    deck.push(card);
  }
  return shuffleDeck(deck);
}

// ユーティリティ関数

/**
 * デッキをシャッフルする
 */
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * ユニークなゲームIDを生成
 */
function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * ゲーム初期化ラッパー関数
 */
export function initializeGame(): GameState {
  // テストデッキを使用してプレイヤーを作成
  const deck1 = createTestDeck("player-1");
  const deck2 = createTestDeck("player-2");
  
  const player1 = createInitialPlayerState("player-1", "プレイヤー1", deck1);
  const player2 = createInitialPlayerState("player-2", "プレイヤー2", deck2);
  
  // シールドのセットアップ（デッキの上から5枚をシールドにする）
  setupShields(player1);
  setupShields(player2);

  return initializeGameState(player1, player2);
}

function setupShields(player: PlayerState) {
    for(let i = 0; i < GAME_CONSTANTS.MAX_SHIELDS + 1; i++) { // 初期シールド5枚
        const card = player.zones.deck.pop();
        if (card) {
            card.zone = "in-shield-zone";
            player.zones.shieldZone.push(card);
            player.shields++;
        }
    }
}

/**
 * フェーズ遷移ラッパー関数
 */
export function transitionPhase(gameState: GameState): GameState {
  return advanceTurnPhase(gameState)
}

