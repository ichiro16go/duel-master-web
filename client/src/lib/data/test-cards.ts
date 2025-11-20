import type { CardDetails } from '$lib/types/card';

export const TEST_CARDS: CardDetails[] = [
  {
    id: 'card_bronze_arm',
    name: '青銅の鎧',
    cost: 3,
    power: 1000,
    rarity: 'common',
    type: 'creature',
    description: 'このクリーチャーをバトルゾーンに出した時、自分の山札の上から1枚目をマナゾーンに置く。',
    abilityText: 'cip-mana-charge-1'
  },
  {
    id: 'card_burning_mane',
    name: '凶戦士ブレイズ・クロー',
    cost: 1,
    power: 1000,
    rarity: 'common',
    type: 'creature',
    description: 'このクリーチャーは、毎ターン攻撃しなければならない。',
    abilityText: 'force-attack'
  },
  {
    id: 'card_holy_spark',
    name: 'ホーリー・スパーク',
    cost: 6,
    power: 0,
    rarity: 'rare',
    type: 'spell',
    description: 'S・トリガー。相手のクリーチャーをすべてタップする。',
    abilityText: 'shield-trigger:tap-all-enemy'
  },
  {
    id: 'card_aqua_hulcus',
    name: 'アクア・ハルカス',
    cost: 3,
    power: 2000,
    rarity: 'common',
    type: 'creature',
    description: 'このクリーチャーをバトルゾーンに出した時、カードを1枚引いてもよい。',
    abilityText: 'cip-draw-1'
  },
  {
    id: 'card_terror_pit',
    name: 'デーモン・ハンド',
    cost: 6,
    power: 0,
    rarity: 'rare',
    type: 'spell',
    description: 'S・トリガー。相手のクリーチャーを1体選び、破壊する。',
    abilityText: 'shield-trigger:destroy-1'
  }
];