import type { GameState } from "$lib/types/game"
import type { GameCard, CardState } from "$lib/types/card"
import type { TurnState, TurnPhase, PhaseExecutionResult } from "$lib/types/turn"
import { GAME_CONSTANTS } from "$lib/utils/game-constants"

/**
 * ターン状態を初期化
 */
export function initializeTurnState(turnNumber: number, currentPlayerIndex: 0 | 1): TurnState {
  return {
    turnNumber,
    currentPlayerIndex,
    currentPhase: "start" as TurnPhase,
    actions: [],
    cardsPlayedThisTurn: [],
    cardsAttackedThisTurn: [],
    manaSpentThisTurn: 0,
    phasePassed: false,
  }
}

/**
 * スタートフェーズの処理
 */
export function executeStartPhase(
  gameState: GameState,
  turnState: TurnState,
  allCards: GameCard[],
): PhaseExecutionResult {
  const messages: string[] = []
  const errors: string[] = []
  const cardsAffected: GameCard[] = []

  const currentPlayer = gameState.players[turnState.currentPlayerIndex]

  // マナをリセット
  const newMaxMana = Math.min(currentPlayer.maxMana + 1, GAME_CONSTANTS.MAX_MANA_PER_TURN)

  messages.push(`最大マナ: ${currentPlayer.maxMana} → ${newMaxMana}`)

  // バトルゾーンのクリーチャーのタップをリセット
  const playerCreatures = allCards.filter(
    (card) => card.owner === currentPlayer.id && card.zone === "in-battle-zone" && card.type === "creature",
  )

  for (const creature of playerCreatures) {
    if (creature.isTapped || creature.isAttacking) {
      creature.isTapped = false
      creature.isAttacking = false
      cardsAffected.push(creature)
      messages.push(`${creature.name} がアンタップされました`)
    }
  }

  return {
    success: true,
    phase: "start" as TurnPhase,
    nextPhase: "draw" as TurnPhase,
    messages,
    cardsAffected,
    errors,
  }
}

/**
 * ドローフェーズの処理
 */
export function executeDrawPhase(
  gameState: GameState,
  turnState: TurnState,
  allCards: GameCard[],
): PhaseExecutionResult {
  const messages: string[] = []
  const errors: string[] = []
  const cardsAffected: GameCard[] = []

  const currentPlayer = gameState.players[turnState.currentPlayerIndex]

  // デッキからカードをドロー
  const playerDeckCards = allCards.filter((card) => card.owner === currentPlayer.id && card.zone === "in-deck")

  if (playerDeckCards.length === 0) {
    errors.push("デッキが空です。敗北します。")
    return {
      success: false,
      phase: "draw" as TurnPhase,
      nextPhase: null,
      messages,
      cardsAffected,
      errors,
    }
  }

  // 1枚ドロー
  const drawnCard = playerDeckCards[0]
  drawnCard.zone = "in-hand" as CardState
  cardsAffected.push(drawnCard)
  messages.push(`${drawnCard.name} をドロー`)

  return {
    success: true,
    phase: "draw" as TurnPhase,
    nextPhase: "main" as TurnPhase,
    messages,
    cardsAffected,
    errors,
  }
}

/**
 * メインフェーズの処理（フェーズ移行のみ、実際のカードプレイはアクション処理で行う）
 */
export function executeMainPhase(
  gameState: GameState,
  turnState: TurnState,
  allCards: GameCard[],
): PhaseExecutionResult {
  const messages: string[] = ["メインフェーズ：カードをプレイできます"]

  return {
    success: true,
    phase: "main" as TurnPhase,
    nextPhase: "attack" as TurnPhase,
    messages,
    cardsAffected: [],
    errors: [],
  }
}

/**
 * アタックフェーズの処理
 */
export function executeAttackPhase(
  gameState: GameState,
  turnState: TurnState,
  allCards: GameCard[],
): PhaseExecutionResult {
  const messages: string[] = ["アタックフェーズ：クリーチャーで攻撃できます"]
  const cardsAffected: GameCard[] = []

  const currentPlayer = gameState.players[turnState.currentPlayerIndex]

  // 攻撃可能なクリーチャーをチェック
  const attackableCreatures = allCards.filter(
    (card) =>
      card.owner === currentPlayer.id &&
      card.zone === "in-battle-zone" &&
      card.type === "creature" &&
      !card.isTapped &&
      card.createdTurn < turnState.turnNumber, // 配置されたターン未満なら攻撃可能
  )

  messages.push(`攻撃可能なクリーチャー: ${attackableCreatures.length}体`)

  return {
    success: true,
    phase: "attack" as TurnPhase,
    nextPhase: "end" as TurnPhase,
    messages,
    cardsAffected,
    errors: [],
  }
}

/**
 * エンドフェーズの処理
 */
export function executeEndPhase(
  gameState: GameState,
  turnState: TurnState,
  allCards: GameCard[],
): PhaseExecutionResult {
  const messages: string[] = []
  const errors: string[] = []
  const cardsAffected: GameCard[] = []

  const currentPlayer = gameState.players[turnState.currentPlayerIndex]

  // 手札の最大枚数チェック（デュエル・マスターズでは通常6枚）
  const handCards = allCards.filter((card) => card.owner === currentPlayer.id && card.zone === "in-hand")

  const MAX_HAND_SIZE = 6

  if (handCards.length > MAX_HAND_SIZE) {
    const excess = handCards.length - MAX_HAND_SIZE
    messages.push(`手札が${excess}枚超過しています。超過分を捨てる必要があります。`)
  } else {
    messages.push("ターンエンド")
  }

  return {
    success: true,
    phase: "end" as TurnPhase,
    nextPhase: null,
    messages,
    cardsAffected,
    errors,
  }
}

/**
 * 次のフェーズを取得
 */
export function getNextPhase(currentPhase: TurnPhase): TurnPhase {
  const phaseOrder = [
    "start" as TurnPhase,
    "draw" as TurnPhase,
    "main" as TurnPhase,
    "attack" as TurnPhase,
    "end" as TurnPhase,
  ]

  const currentIndex = phaseOrder.indexOf(currentPhase)
  return phaseOrder[(currentIndex + 1) % phaseOrder.length]
}

/**
 * フェーズを実行
 */
export function executePhase(
  phase: TurnPhase,
  gameState: GameState,
  turnState: TurnState,
  allCards: GameCard[],
): PhaseExecutionResult {
  switch (phase) {
    case "start" as TurnPhase:
      return executeStartPhase(gameState, turnState, allCards)
    case "draw" as TurnPhase:
      return executeDrawPhase(gameState, turnState, allCards)
    case "main" as TurnPhase:
      return executeMainPhase(gameState, turnState, allCards)
    case "attack" as TurnPhase:
      return executeAttackPhase(gameState, turnState, allCards)
    case "end" as TurnPhase:
      return executeEndPhase(gameState, turnState, allCards)
    default:
      return {
        success: false,
        phase: "start" as TurnPhase,
        nextPhase: null,
        messages: ["不正なフェーズ"],
        cardsAffected: [],
        errors: ["Unknown phase"],
      }
  }
}

/**
 * ターン遷移処理
 */
export function advanceTurn(
  gameState: GameState,
  turnState: TurnState,
): { newGameState: GameState; newTurnState: TurnState } {
  const nextPlayerIndex = ((turnState.currentPlayerIndex + 1) % 2) as 0 | 1
  const nextTurnNumber = turnState.turnNumber + 1

  const newGameState = {
    ...gameState,
    currentPlayerIndex: nextPlayerIndex,
    turnCount: nextTurnNumber,
  }

  const newTurnState = initializeTurnState(nextTurnNumber, nextPlayerIndex)

  return { newGameState, newTurnState }
}

/**
 * ターン内のアクションを記録
 */
export function recordTurnAction(
  gameState: GameState,
  turnState: TurnState,
  actionType: string,
  data: Record<string, any>,
): TurnState {
  const newAction = {
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    playerId: gameState.players[turnState.currentPlayerIndex].id,
    type: actionType as any,
    data,
    timestamp: Date.now(),
    resolved: false,
  }

  return {
    ...turnState,
    actions: [...turnState.actions, newAction],
  }
}

/**
 * ターンをスキップ（パス）
 */
export function passTurn(turnState: TurnState): TurnState {
  return {
    ...turnState,
    phasePassed: true,
  }
}

/**
 * ターンのサマリーを取得
 */
export function getTurnSummary(turnState: TurnState): string {
  return `
ターン ${turnState.turnNumber} サマリー
フェーズ: ${turnState.currentPhase}
プレイされたカード: ${turnState.cardsPlayedThisTurn.length}枚
攻撃したカード: ${turnState.cardsAttackedThisTurn.length}枚
消費マナ: ${turnState.manaSpentThisTurn}
実行されたアクション: ${turnState.actions.length}件
  `
}
