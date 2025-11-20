import type { GameState } from "$lib/types/game"
import type { GameCard } from "$lib/types/card"
import type { TurnState, TurnPhase } from "$lib/types/turn"
import { executePhase, getNextPhase, advanceTurn } from "$lib/utils/turn-phase-engine"

/**
 * ゲーム状態とターン状態を同期
 */
export function syncGameAndTurnState(gameState: GameState, turnState: TurnState): GameState {
  return {
    ...gameState,
    currentPlayerIndex: turnState.currentPlayerIndex,
    currentPhase: turnState.currentPhase as any,
  }
}

/**
 * フェーズを進める
 */
export function advancePhase(
  gameState: GameState,
  turnState: TurnState,
  allCards: GameCard[],
): {
  gameState: GameState
  turnState: TurnState
  phaseResult: any
} {
  // 現在のフェーズを実行
  const phaseResult = executePhase(turnState.currentPhase, gameState, turnState, allCards)

  if (!phaseResult.success && phaseResult.errors.length > 0) {
    return { gameState, turnState, phaseResult }
  }

  // 次のフェーズを取得
  const nextPhase = getNextPhase(turnState.currentPhase)

  // エンドフェーズから次のターンへ遷移
  if (turnState.currentPhase === "END") {
    const { newGameState, newTurnState } = advanceTurn(gameState, turnState)

    return {
      gameState: syncGameAndTurnState(newGameState, newTurnState),
      turnState: { ...newTurnState, currentPhase: nextPhase },
      phaseResult: { ...phaseResult, isNewTurn: true },
    }
  }

  return {
    gameState,
    turnState: { ...turnState, currentPhase: nextPhase },
    phaseResult,
  }
}

/**
 * 特定のフェーズに直接移動（デバッグ用）
 */
export function jumpToPhase(turnState: TurnState, targetPhase: TurnPhase): TurnState {
  return {
    ...turnState,
    currentPhase: targetPhase,
  }
}

/**
 * ターンの状態をリセット（ゲーム開始時）
 */
export function resetTurnState(turnState: TurnState): TurnState {
  return {
    ...turnState,
    cardsPlayedThisTurn: [],
    cardsAttackedThisTurn: [],
    manaSpentThisTurn: 0,
    phasePassed: false,
  }
}
