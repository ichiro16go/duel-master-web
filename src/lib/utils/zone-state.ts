import type { GameCard, CardState } from "$lib/types/card"

/**
 * ゾーン管理システムの状態
 */
export interface ZoneState {
  allCards: GameCard[]
  moveHistory: Array<{ card: GameCard; event: string; turn: number }>
}

/**
 * ゾーン状態を初期化
 */
export function initializeZoneState(): ZoneState {
  return {
    allCards: [],
    moveHistory: [],
  }
}

/**
 * カードをゾーンに追加
 */
export function addCardToZoneState(state: ZoneState, card: GameCard): ZoneState {
  return {
    ...state,
    allCards: [...state.allCards, card],
    moveHistory: [...state.moveHistory, { card, event: `Added to ${card.zone}`, turn: 0 }],
  }
}

/**
 * カードをゾーン間で移動
 */
export function moveCardBetweenZones(
  state: ZoneState,
  cardInstanceId: string,
  toZone: CardState,
  turn: number,
): ZoneState {
  const updatedCards = state.allCards.map((card) => {
    if (card.instanceId === cardInstanceId) {
      return { ...card, zone: toZone }
    }
    return card
  })

  const movedCard = updatedCards.find((c) => c.instanceId === cardInstanceId)

  return {
    ...state,
    allCards: updatedCards,
    moveHistory: [
      ...state.moveHistory,
      {
        card: movedCard!,
        event: `Moved to ${toZone}`,
        turn,
      },
    ],
  }
}

/**
 * カードを複数ゾーンで取得
 */
export function getCardsByZones(state: ZoneState, zones: CardState[]): GameCard[] {
  return state.allCards.filter((card) => zones.includes(card.zone))
}

/**
 * 特定プレイヤーのカードのみを取得
 */
export function getPlayerCards(state: ZoneState, playerId: string): GameCard[] {
  return state.allCards.filter((card) => card.owner === playerId)
}

/**
 * プレイヤーのゾーン別カード数を取得
 */
export function getPlayerZoneStats(state: ZoneState, playerId: string): Record<CardState, number> {
  const playerCards = getPlayerCards(state, playerId)

  return {
    "in-hand": playerCards.filter((c) => c.zone === "in-hand").length,
    "in-deck": playerCards.filter((c) => c.zone === "in-deck").length,
    "in-mana-zone": playerCards.filter((c) => c.zone === "in-mana-zone").length,
    "in-battle-zone": playerCards.filter((c) => c.zone === "in-battle-zone").length,
    "in-shield-zone": playerCards.filter((c) => c.zone === "in-shield-zone").length,
    "in-graveyard": playerCards.filter((c) => c.zone === "in-graveyard").length,
    tapped: playerCards.filter((c) => c.isTapped).length,
    attacking: playerCards.filter((c) => c.isAttacking).length,
  }
}

/**
 * ゾーン状態の全履歴を取得
 */
export function getZoneMoveHistory(state: ZoneState): typeof state.moveHistory {
  return [...state.moveHistory]
}

/**
 * カードの現在位置を取得
 */
export function getCardCurrentZone(state: ZoneState, cardInstanceId: string): CardState | null {
  const card = state.allCards.find((c) => c.instanceId === cardInstanceId)
  return card?.zone ?? null
}
