import type { Card, PlayerZones } from "$lib/types/game"

/**
 * 手札からカードを取得
 */
export function getCardFromHand(hand: Card[], cardId: string): Card | undefined {
  return hand.find((c) => c.id === cardId)
}

/**
 * 手札からカードを移動
 */
export function moveCardFromHand(
  hand: Card[],
  cardId: string,
): {
  success: boolean
  card?: Card
  updatedHand: Card[]
} {
  const cardIndex = hand.findIndex((c) => c.id === cardId)

  if (cardIndex === -1) {
    return { success: false, updatedHand: hand }
  }

  const card = hand[cardIndex]
  const updatedHand = hand.filter((_, index) => index !== cardIndex)

  return { success: true, card, updatedHand }
}

/**
 * デッキからドロー
 */
export function drawCard(
  deck: Card[],
  hand: Card[],
  count = 1,
): {
  success: boolean
  drawnCards: Card[]
  updatedDeck: Card[]
  updatedHand: Card[]
  errorMessage?: string
} {
  if (deck.length < count) {
    return {
      success: false,
      drawnCards: [],
      updatedDeck: deck,
      updatedHand: hand,
      errorMessage: `デッキのカード枚数が不足しています。必要: ${count}, 利用可能: ${deck.length}`,
    }
  }

  const drawnCards = deck.slice(0, count)
  const updatedDeck = deck.slice(count)
  const updatedHand = [...hand, ...drawnCards]

  return {
    success: true,
    drawnCards,
    updatedDeck,
    updatedHand,
  }
}

/**
 * カードを墓地に送る
 */
export function sendToGraveyard(graveyard: Card[], card: Card): Card[] {
  return [...graveyard, card]
}

/**
 * バトルゾーンにカードを配置
 */
export function addCardToBattleZone(battleZone: Card[], card: Card): Card[] {
  return [...battleZone, card]
}

/**
 * バトルゾーンからカードを削除
 */
export function removeCardFromBattleZone(
  battleZone: Card[],
  cardId: string,
): {
  success: boolean
  updatedZone: Card[]
  removedCard?: Card
} {
  const cardIndex = battleZone.findIndex((c) => c.id === cardId)

  if (cardIndex === -1) {
    return { success: false, updatedZone: battleZone }
  }

  const removedCard = battleZone[cardIndex]
  const updatedZone = battleZone.filter((_, index) => index !== cardIndex)

  return { success: true, updatedZone, removedCard }
}

/**
 * シールドゾーンにカードを追加
 */
export function addCardToShieldZone(
  shieldZone: Card[],
  card: Card,
): {
  success: boolean
  updatedZone: Card[]
  errorMessage?: string
} {
  if (shieldZone.length >= 4) {
    return {
      success: false,
      updatedZone: shieldZone,
      errorMessage: "シールドゾーンは4枚までです",
    }
  }

  return {
    success: true,
    updatedZone: [...shieldZone, card],
  }
}

/**
 * シールドゾーンからカードを削除（ブレイク時）
 */
export function removeCardFromShieldZone(
  shieldZone: Card[],
  index: number,
): {
  success: boolean
  updatedZone: Card[]
  removedCard?: Card
  errorMessage?: string
} {
  if (index < 0 || index >= shieldZone.length) {
    return {
      success: false,
      updatedZone: shieldZone,
      errorMessage: "無効なシールドインデックス",
    }
  }

  const removedCard = shieldZone[index]
  const updatedZone = shieldZone.filter((_, i) => i !== index)

  return { success: true, updatedZone, removedCard }
}

/**
 * プレイヤーの全ゾーンをリセット
 */
export function resetPlayerZones(zones: PlayerZones): PlayerZones {
  return {
    hand: [...zones.hand],
    deck: [...zones.deck],
    graveyard: [],
    manaZone: [],
    battleZone: [],
    shieldZone: [],
  }
}

/**
 * ゾーン内のカード総数を取得
 */
export function getCardCountInZone(zone: Card[]): number {
  return zone.length
}

/**
 * 全ゾーンのカード総数を取得
 */
export function getTotalCardCount(zones: PlayerZones): number {
  return (
    zones.hand.length +
    zones.deck.length +
    zones.graveyard.length +
    zones.manaZone.length +
    zones.battleZone.length +
    zones.shieldZone.length
  )
}
