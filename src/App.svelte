<script lang="ts">
  import { analyzeKana } from './lib/vowels'
  import { search, parseQuery, type Poem } from './lib/search'
  import { RAW_POEMS } from './data/poems'

  // モジュール初期化時に全 100 首の母音列とかな→母音対応を計算
  const poems: Poem[] = RAW_POEMS.map((p, i) => {
    const a = analyzeKana(p.reading)
    return {
      id: i + 1,
      text: p.text,
      author: p.author,
      reading: p.reading,
      vowels: a.vowels,
      kanaToVowel: a.kanaToVowel,
    }
  })

  let queryInput = ''
  const limit = 30

  $: queryVowels = parseQuery(queryInput)
  $: results = search(queryVowels, poems).slice(0, limit)
</script>

<main>
  <h1>百人一首 韻検索</h1>
  <p class="subtitle">
    <code>a</code>, <code>i</code>, <code>u</code>, <code>e</code>,
    <code>o</code> を入力。fzf 風に飛び飛びでも、母音が少し違ってもヒットします。
  </p>

  <input
    type="text"
    bind:value={queryInput}
    placeholder="例: aiueo"
    autocomplete="off"
    spellcheck="false"
    autocapitalize="off"
  />

  {#if queryVowels.length > 0}
    <p class="query-display">
      クエリ: <code>{queryVowels.join('')}</code>
      <span class="legend">
        <span class="swatch hit-exact"></span>完全一致
        <span class="swatch hit-near"></span>近い母音
      </span>
    </p>
  {/if}

  <ol class="results">
    {#each results as result (result.poem.id)}
      <li>
        <div class="meta">
          <span class="num">{result.poem.id}</span>
          <span class="author">{result.poem.author}</span>
          {#if queryVowels.length > 0}
            <span class="score">cost {result.score.toFixed(2)}</span>
          {/if}
        </div>
        <div class="text">{result.poem.text}</div>
        <div class="reading">
          {#each [...result.poem.reading] as ch, i}
            {@const vi = result.poem.kanaToVowel[i]}
            {@const kind = vi != null ? result.matches.get(vi) : undefined}
            <span
              class:hit-exact={kind === 'exact'}
              class:hit-near={kind === 'near'}>{ch}</span
            >
          {/each}
        </div>
        <div class="vowels">
          {#each result.poem.vowels as v, i}
            {@const kind = result.matches.get(i)}
            <span
              class:hit-exact={kind === 'exact'}
              class:hit-near={kind === 'near'}>{v}</span
            >
          {/each}
        </div>
      </li>
    {/each}
  </ol>
</main>

<style>
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
  }
  h1 {
    margin: 0 0 0.4rem;
    font-size: 1.5rem;
  }
  .subtitle {
    margin: 0 0 1.5rem;
    color: #666;
    font-size: 0.9rem;
  }
  input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    font-size: 1.1rem;
    font-family: ui-monospace, SFMono-Regular, monospace;
    letter-spacing: 0.1em;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
  }
  input:focus {
    outline: 2px solid #5a8;
    outline-offset: -1px;
    border-color: transparent;
  }
  .query-display {
    margin: 0.6rem 0 0;
    font-size: 0.85rem;
    color: #666;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.8rem;
  }
  .legend {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: #888;
  }
  .swatch {
    display: inline-block;
    width: 0.9em;
    height: 0.9em;
    border-radius: 2px;
    vertical-align: -0.1em;
    margin-right: 0.2rem;
  }
  .legend .swatch + .swatch {
    margin-left: 0.6rem;
  }
  code {
    background: #eef;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 0.9em;
  }
  .results {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0 0;
  }
  .results li {
    border-top: 1px solid #e5e3da;
    padding: 0.9rem 0;
  }
  .meta {
    display: flex;
    gap: 0.8rem;
    align-items: baseline;
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 0.35rem;
  }
  .num {
    font-weight: bold;
    color: #444;
    min-width: 1.5em;
  }
  .author {
    color: #555;
  }
  .score {
    margin-left: auto;
    font-family: ui-monospace, SFMono-Regular, monospace;
  }
  .text {
    font-size: 1.05rem;
  }
  .reading {
    font-size: 0.9rem;
    color: #777;
    margin-top: 0.15rem;
  }
  .vowels {
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 0.8rem;
    color: #aaa;
    margin-top: 0.1rem;
    letter-spacing: 0.15em;
  }
  /* ハイライト: 完全一致は濃い黄、近い母音は薄い緑 */
  .hit-exact {
    background: #ffd54f;
    color: #3a2700;
    border-radius: 2px;
    padding: 0 1px;
  }
  .hit-near {
    background: #cfe9c8;
    color: #2b4a26;
    border-radius: 2px;
    padding: 0 1px;
  }
  .reading .hit-exact,
  .reading .hit-near {
    /* かな部分はもう少し控えめに */
    padding: 0;
  }
</style>
