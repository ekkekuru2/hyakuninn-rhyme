import type { Vowel } from './vowels'

export type Poem = {
  id: number
  text: string
  author: string
  reading: string
  vowels: Vowel[]
}

export type ScoredPoem = {
  poem: Poem
  score: number
}

// 「近い母音」: 完全一致でなくても部分的にマッチさせる対象。
// a-o (奥舌)、i-e (前舌)、u-o (円唇)、u-i (高母音) を近いとみなす。
const NEAR: Record<Vowel, Vowel[]> = {
  a: ['o'],
  o: ['a', 'u'],
  u: ['o', 'i'],
  i: ['u', 'e'],
  e: ['i'],
}

const COST_EXACT = 0
const COST_NEAR = 1.0
const COST_FAR = 4.0
const COST_GAP = 0.05 // ギャップは ほぼ無料 (recall 優先)

function vowelCost(q: Vowel, t: Vowel): number {
  if (q === t) return COST_EXACT
  if (NEAR[q].includes(t)) return COST_NEAR
  return COST_FAR
}

// Needleman-Wunsch 風アラインメント。
// query の全文字を target の何らかの連続区間にマッチさせる最小コストを返す。
// - target のどこから始めても良い (dp[0][j] = 0)
// - target の途中で終わって良い (最後に dp[m][j] の min)
// - 各マッチは vowelCost、ギャップ (target を skip) は COST_GAP
function alignCost(query: Vowel[], target: Vowel[]): number {
  const m = query.length
  const n = target.length
  if (m === 0) return 0
  if (m > n) return Infinity

  let prev = new Array<number>(n + 1).fill(0)
  let curr = new Array<number>(n + 1).fill(Infinity)

  for (let i = 1; i <= m; i++) {
    curr[0] = Infinity
    for (let j = 1; j <= n; j++) {
      const viaMatch = prev[j - 1] + vowelCost(query[i - 1], target[j - 1])
      const viaGap = curr[j - 1] + COST_GAP
      curr[j] = Math.min(viaMatch, viaGap)
    }
    const tmp = prev
    prev = curr
    curr = tmp
  }

  let best = Infinity
  for (let j = m; j <= n; j++) best = Math.min(best, prev[j])
  return best
}

export function search(query: Vowel[], poems: Poem[]): ScoredPoem[] {
  if (query.length === 0) {
    return poems.map(p => ({ poem: p, score: 0 }))
  }
  const scored = poems.map(poem => ({
    poem,
    score: alignCost(query, poem.vowels),
  }))
  scored.sort((a, b) => a.score - b.score)
  return scored
}

export function parseQuery(input: string): Vowel[] {
  const result: Vowel[] = []
  for (const ch of input.toLowerCase()) {
    if (ch === 'a' || ch === 'i' || ch === 'u' || ch === 'e' || ch === 'o') {
      result.push(ch)
    }
  }
  return result
}
