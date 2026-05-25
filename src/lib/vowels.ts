export type Vowel = 'a' | 'i' | 'u' | 'e' | 'o'

// 歴史的仮名遣い (は/ひ/ふ/へ/ほ・ゐ・ゑ・を・ぢ・づ) も母音だけなら現代仮名遣いと同じ。
// 読みデータは原文の歴史的仮名遣いのままで OK。
const KANA_TO_VOWEL: Record<string, Vowel> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'a', き: 'i', く: 'u', け: 'e', こ: 'o',
  が: 'a', ぎ: 'i', ぐ: 'u', げ: 'e', ご: 'o',
  さ: 'a', し: 'i', す: 'u', せ: 'e', そ: 'o',
  ざ: 'a', じ: 'i', ず: 'u', ぜ: 'e', ぞ: 'o',
  た: 'a', ち: 'i', つ: 'u', て: 'e', と: 'o',
  だ: 'a', ぢ: 'i', づ: 'u', で: 'e', ど: 'o',
  な: 'a', に: 'i', ぬ: 'u', ね: 'e', の: 'o',
  は: 'a', ひ: 'i', ふ: 'u', へ: 'e', ほ: 'o',
  ば: 'a', び: 'i', ぶ: 'u', べ: 'e', ぼ: 'o',
  ぱ: 'a', ぴ: 'i', ぷ: 'u', ぺ: 'e', ぽ: 'o',
  ま: 'a', み: 'i', む: 'u', め: 'e', も: 'o',
  や: 'a', ゆ: 'u', よ: 'o',
  ら: 'a', り: 'i', る: 'u', れ: 'e', ろ: 'o',
  わ: 'a', ゐ: 'i', ゑ: 'e', を: 'o',
}

const YOON: Record<string, Vowel> = {
  ゃ: 'a', ゅ: 'u', ょ: 'o',
}

// 拗音は直前の母音を上書き ("きゃ" → i + a を a 一音にまとめる)。
// 長音 "ー" は直前の母音を 1 回繰り返す。
// 撥音 "ん"・促音 "っ" は母音を持たないのでスキップ。
export function kanaToVowels(kana: string): Vowel[] {
  const result: Vowel[] = []
  for (const ch of kana) {
    const yoon = YOON[ch]
    if (yoon !== undefined) {
      if (result.length > 0) result.pop()
      result.push(yoon)
      continue
    }
    if (ch === 'ー') {
      if (result.length > 0) result.push(result[result.length - 1])
      continue
    }
    const v = KANA_TO_VOWEL[ch]
    if (v !== undefined) result.push(v)
  }
  return result
}
