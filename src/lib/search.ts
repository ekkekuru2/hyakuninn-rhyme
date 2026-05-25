import type { Vowel } from './vowels'

export type Poem = {
  id: number
  text: string
  author: string
  reading: string
  vowels: Vowel[]
  kanaToVowel: (number | null)[]
}

export type MatchKind = 'exact' | 'near'

export type ScoredPoem = {
  poem: Poem
  score: number
  // ヒットした target (poem.vowels) の index → 一致の種類
  matches: Map<number, MatchKind>
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

// Needleman-Wunsch 風アラインメント + backtracking。
// query の全文字を target の何らかの連続区間にマッチさせる最小コストと、
// 採用された target 位置 (とその一致種別) を返す。
function alignWithMatches(
  query: Vowel[],
  target: Vowel[],
): { score: number; matches: Map<number, MatchKind> } {
  const m = query.length
  const n = target.length
  if (m === 0) return { score: 0, matches: new Map() }
  if (m > n) return { score: Infinity, matches: new Map() }

  type Op = 'start' | 'match' | 'gap'
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(Infinity),
  )
  const op: Op[][] = Array.from({ length: m + 1 }, () =>
    new Array<Op>(n + 1).fill('start'),
  )

  for (let j = 0; j <= n; j++) dp[0][j] = 0 // target のどこから始めても良い

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const viaMatch = dp[i - 1][j - 1] + vowelCost(query[i - 1], target[j - 1])
      const viaGap = dp[i][j - 1] + COST_GAP
      if (viaMatch <= viaGap) {
        dp[i][j] = viaMatch
        op[i][j] = 'match'
      } else {
        dp[i][j] = viaGap
        op[i][j] = 'gap'
      }
    }
  }

  let bestScore = Infinity
  let bestJ = -1
  for (let j = m; j <= n; j++) {
    if (dp[m][j] < bestScore) {
      bestScore = dp[m][j]
      bestJ = j
    }
  }
  if (bestScore === Infinity || bestJ < 0) {
    return { score: Infinity, matches: new Map() }
  }

  const matches = new Map<number, MatchKind>()
  let i = m
  let j = bestJ
  while (i > 0) {
    if (op[i][j] === 'match') {
      const tPos = j - 1
      const kind: MatchKind = query[i - 1] === target[tPos] ? 'exact' : 'near'
      matches.set(tPos, kind)
      i--
      j--
    } else {
      j--
    }
  }

  return { score: bestScore, matches }
}

export function search(query: Vowel[], poems: Poem[]): ScoredPoem[] {
  if (query.length === 0) {
    return poems.map(p => ({
      poem: p,
      score: 0,
      matches: new Map<number, MatchKind>(),
    }))
  }
  const scored = poems.map(poem => {
    const r = alignWithMatches(query, poem.vowels)
    return { poem, score: r.score, matches: r.matches }
  })
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
