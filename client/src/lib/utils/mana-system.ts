import type { Card, ManaCost } from "$lib/types/game"
import { GAME_CONSTANTS } from "$lib/utils/game-constants"

/**
 * マナコストが支払可能かを検証
 */
export function validateManaCost(requiredCost: number, availableMana: number, paymentCards: Card[]): ManaCost {
  // 利用可能マナが必要マナよりも少ない場合
  if (availableMana < requiredCost) {
    return {
      amount: requiredCost,
      paymentCards: [],
      isValid: false,
      errorMessage: `マナが不足しています。必要: ${requiredCost}, 利用可能: ${availableMana}`,
    }
  }

  // マナゾーンのカードでマナを補填できるかをチェック
  const additionalManaCost = requiredCost - availableMana

  if (additionalManaCost > 0) {
    if (paymentCards.length < additionalManaCost) {
      return {
        amount: requiredCost,
        paymentCards: [],
        isValid: false,
        errorMessage: `マナゾーンのカードが不足しています。必要: ${additionalManaCost}, 利用可能: ${paymentCards.length}`,
      }
    }

    // 支払いに使用するカードを選択
    const selectedCards = paymentCards.slice(0, additionalManaCost)
    return {
      amount: requiredCost,
      paymentCards: selectedCards,
      isValid: true,
    }
  }

  return {
    amount: requiredCost,
    paymentCards: [],
    isValid: true,
  }
}

/**
 * マナゾーンのカードがマナとして利用可能かをチェック
 */
export function isValidManaCard(card: Card): boolean {
  return card.type === "creature" || card.type === "spell"
}

/**
 * 複数枚のカードを同時にマナゾーンに配置する場合の検証
 */
export function validateMultipleManaPlacement(
  currentManaCount: number,
  cardsToPlace: Card[],
): { isValid: boolean; errorMessage?: string } {
  const invalidCards = cardsToPlace.filter((card) => !isValidManaCard(card))

  if (invalidCards.length > 0) {
    return {
      isValid: false,
      errorMessage: `マナゾーンに配置できないカード: ${invalidCards.map((c) => c.name).join(", ")}`,
    }
  }

  return { isValid: true }
}

/**
 * ターンに利用可能なマナを計算
 */
export function calculateAvailableMana(currentMana: number, manaZoneCards: Card[]): number {
  let total = currentMana

  for (const card of manaZoneCards) {
    if (isValidManaCard(card)) {
      total += 1 // 各カードが1マナを提供
    }
  }

  return Math.min(total, GAME_CONSTANTS.MAX_MANA_PER_TURN)
}

/**
 * マナゾーンにカードを配置
 */
export function addCardToManaZone(
  manaZone: Card[],
  card: Card,
): { success: boolean; updatedZone: Card[]; errorMessage?: string } {
  if (!isValidManaCard(card)) {
    return {
      success: false,
      updatedZone: manaZone,
      errorMessage: "このカードはマナゾーンに配置できません",
    }
  }

  return {
    success: true,
    updatedZone: [...manaZone, card],
  }
}

/**
 * マナゾーンからカードを削除
 */
export function removeCardFromManaZone(
  manaZone: Card[],
  cardId: string,
): { success: boolean; updatedZone: Card[]; removedCard?: Card } {
  const cardIndex = manaZone.findIndex((c) => c.id === cardId)

  if (cardIndex === -1) {
    return { success: false, updatedZone: manaZone }
  }

  const removedCard = manaZone[cardIndex]
  const updatedZone = manaZone.filter((_, index) => index !== cardIndex)

  return { success: true, updatedZone, removedCard }
}

/**
 * ターン開始時にマナを回復
 */
export function resetManaForNewTurn(currentMana: number, maxMana: number, manaZoneCards: Card[]): number {
  // 最大マナを1増加（最大13まで）
  const newMaxMana = Math.min(maxMana + 1, GAME_CONSTANTS.MAX_MANA_PER_TURN)

  // ターン開始時に全マナを回復
  const totalAvailableMana = newMaxMana + manaZoneCards.length

  return Math.min(totalAvailableMana, GAME_CONSTANTS.MAX_MANA_PER_TURN)
}

/**
 * カードをプレイするのに必要なマナの支払いをシミュレート
 */
export function simulateManaCost(
  costAmount: number,
  availableMana: number,
  manaZoneCards: Card[],
  selectedManaCards: Card[] = [],
): {
  canPay: boolean
  manaUsed: number
  manaCardsRequired: Card[]
  remainingMana: number
} {
  let remainingCost = costAmount
  const manaUsed = availableMana
  const manaCardsToUse: Card[] = []

  // 通常マナから先に消費
  if (availableMana >= costAmount) {
    return {
      canPay: true,
      manaUsed: costAmount,
      manaCardsRequired: [],
      remainingMana: availableMana - costAmount,
    }
  }

  remainingCost = costAmount - availableMana

  // マナゾーンのカードで補填
  let selectedCount = 0
  for (const card of selectedManaCards) {
    if (remainingCost <= 0) break
    manaCardsToUse.push(card)
    remainingCost--
    selectedCount++
  }

  if (remainingCost > 0) {
    return {
      canPay: false,
      manaUsed: availableMana,
      manaCardsRequired: [],
      remainingMana: 0,
    }
  }

  return {
    canPay: true,
    manaUsed: availableMana,
    manaCardsRequired: manaCardsToUse,
    remainingMana: 0,
  }
}

/**
 * カードプレイ後のマナを更新
 */
export function applyManaCost(
  currentMana: number,
  costAmount: number,
  manaZone: Card[],
  manaCardsUsed: Card[],
): {
  newMana: number
  newManaZone: Card[]
} {
  const newMana = Math.max(0, currentMana - Math.min(costAmount, currentMana))
  let newManaZone = [...manaZone]

  // マナゾーンのカードを消費
  const remainingCost = costAmount - Math.min(costAmount, currentMana)

  for (let i = 0; i < remainingCost && newManaZone.length > 0; i++) {
    const cardToRemove = manaCardsUsed[i]
    if (cardToRemove) {
      newManaZone = newManaZone.filter((c) => c.id !== cardToRemove.id)
    }
  }

  return { newMana, newManaZone }
}

/**
 * マナ支払いの詳細ログを生成（デバッグ用）
 */
export function generateManaCostLog(
  cardName: string,
  costAmount: number,
  availableMana: number,
  manaCardsUsed: Card[],
): string {
  const baseAmount = Math.min(costAmount, availableMana)
  const supplementAmount = Math.max(0, costAmount - availableMana)

  let log = `【マナ支払い】${cardName}\n`
  log += `コスト: ${costAmount}\n`
  log += `基本マナ: ${baseAmount}使用\n`

  if (manaCardsUsed.length > 0) {
    log += `マナゾーン: ${manaCardsUsed.map((c) => c.name).join(", ")} を消費\n`
  }

  log += `合計: ${baseAmount + supplementAmount}`

  return log
}
