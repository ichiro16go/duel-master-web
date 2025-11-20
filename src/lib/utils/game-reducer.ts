import type { GameState, PlayerState, Card } from "$lib/types/game"
import { GAME_CONSTANTS } from "$lib/utils/game-constants"

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
export function checkGameEnd(gameState: GameState): { isEnded: boolean; winner: 0 | 1 | null } {
  const [player1, player2] = gameState.players

  if (player1.shields >= GAME_CONSTANTS.DEFEAT_SHIELD_DESTROYED) {
    return { isEnded: true, winner: 1 }
  }
  if (player2.shields >= GAME_CONSTANTS.DEFEAT_SHIELD_DESTROYED) {
    return { isEnded: true, winner: 0 }
  }

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
  const player1 = createInitialPlayerState("player-1", "プレイヤー1", [])
  const player2 = createInitialPlayerState("player-2", "プレイヤー2", [])
  return initializeGameState(player1, player2)
}

/**
 * フェーズ遷移ラッパー関数
 */
export function transitionPhase(gameState: GameState): GameState {
  return advanceTurnPhase(gameState)
}
