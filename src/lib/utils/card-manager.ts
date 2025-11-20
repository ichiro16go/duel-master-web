import type { GameCard, CardDetails, CardState, CardMoveEvent } from "$lib/types/card"

/**
 * 新しいカードインスタンスを生成
 */
export function createCardInstance(
  cardDetails: CardDetails,
  owner: string,
  instanceId: string,
  currentTurn: number,
): GameCard {
  return {
    ...cardDetails,
    instanceId,
    owner,
    zone: "in-hand" as CardState,
    isTapped: false,
    isAttacking: false,
    damageOnCard: 0,
    canShieldTrigger: false,
    createdTurn: currentTurn,
  }
}

/**
 * カードをタップ
 */
export function tapCard(card: GameCard): GameCard {
  return { ...card, isTapped: true }
}

/**
 * カードをアンタップ
 */
export function untapCard(card: GameCard): GameCard {
  return { ...card, isTapped: false }
}

/**
 * カードに攻撃フラグを付与
 */
export function markCardAsAttacking(card: GameCard): GameCard {
  return { ...card, isAttacking: true, isTapped: true }
}

/**
 * カードの攻撃フラグを解除
 */
export function unmarkCardAsAttacking(card: GameCard): GameCard {
  return { ...card, isAttacking: false }
}

/**
 * カードにダメージを記録
 */
export function addDamageToCard(card: GameCard, damage: number): GameCard {
  const newDamage = card.damageOnCard + damage

  // パワー以上のダメージで破壊
  if (newDamage >= card.power) {
    return { ...card, damageOnCard: card.power }
  }

  return { ...card, damageOnCard: newDamage }
}

/**
 * カードのダメージをリセット（ターンリセット等）
 */
export function resetCardDamage(card: GameCard): GameCard {
  return { ...card, damageOnCard: 0 }
}

/**
 * カードがS・トリガー判定可能かを設定
 */
export function setShieldTriggerEligibility(card: GameCard, eligible: boolean): GameCard {
  return { ...card, canShieldTrigger: eligible }
}

/**
 * 複数のカードを特定のゾーンでフィルタ
 */
export function filterCardsByZone(cards: GameCard[], zone: CardState): GameCard[] {
  return cards.filter((card) => card.zone === zone)
}

/**
 * プレイヤーの全カードを取得
 */
export function getPlayerAllCards(cards: GameCard[], playerId: string): GameCard[] {
  return cards.filter((card) => card.owner === playerId)
}

/**
 * バトルゾーンのクリーチャーを取得
 */
export function getCreaturesInBattleZone(cards: GameCard[], playerId: string): GameCard[] {
  return cards.filter((card) => card.owner === playerId && card.zone === "in-battle-zone" && card.type === "creature")
}

/**
 * 破壊されるべきカードを判定
 */
export function getDestroyedCards(cards: GameCard[]): GameCard[] {
  return cards.filter((card) => card.damageOnCard >= card.power && card.zone === "in-battle-zone")
}

/**
 * カード移動ログを記録
 */
export function recordCardMove(cardId: string, fromZone: CardState, toZone: CardState, turn: number): CardMoveEvent {
  return {
    cardId,
    fromZone,
    toZone,
    turn,
    timestamp: Date.now(),
  }
}

/**
 * 特定プレイヤーのタップされていないクリーチャー数を取得
 */
export function getUntappedCreatureCount(cards: GameCard[], playerId: string): number {
  return cards.filter(
    (card) => card.owner === playerId && card.zone === "in-battle-zone" && card.type === "creature" && !card.isTapped,
  ).length
}

/**
 * ターン終了時のカード状態リセット
 */
export function resetCardsForNewTurn(cards: GameCard[]): GameCard[] {
  return cards.map((card) => {
    if (card.zone === "in-battle-zone") {
      return {
        ...card,
        isTapped: false,
        isAttacking: false,
        damageOnCard: 0,
      }
    }
    return card
  })
}

/**
 * カード検索（名前またはIDで）
 */
export function searchCard(cards: GameCard[], query: string): GameCard[] {
  const lowerQuery = query.toLowerCase()
  return cards.filter(
    (card) =>
      card.name.toLowerCase().includes(lowerQuery) || card.id.includes(query) || card.instanceId.includes(query),
  )
}

/**
 * ゾーン内のカード数を取得
 */
export function getCardCountInZone(cards: GameCard[], playerId: string, zone: CardState): number {
  return cards.filter((card) => card.owner === playerId && card.zone === zone).length
}

/**
 * 複数ゾーン間のカード一括移動
 */
export function moveCardsToZone(cards: GameCard[], cardIds: string[], targetZone: CardState): GameCard[] {
  return cards.map((card) => {
    if (cardIds.includes(card.instanceId)) {
      return { ...card, zone: targetZone, isTapped: false, isAttacking: false }
    }
    return card
  })
}

/**
 * カードの可視情報を取得（相手には非表示情報を隠す）
 */
export function getVisibleCardInfo(card: GameCard, isOwner: boolean): Partial<GameCard> {
  if (isOwner) {
    return card // 所有者には全情報表示
  }

  // 相手には裏向きカード情報のみ
  if (card.zone === "in-deck" || (card.zone === "in-hand" && !isOwner)) {
    return {
      instanceId: card.instanceId,
      zone: card.zone,
      owner: card.owner,
      isTapped: false,
      isAttacking: false,
    }
  }

  return card
}
