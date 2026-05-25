<script lang="ts">
  import { kanaToVowels } from './lib/vowels'
  import { search, parseQuery, type Poem } from './lib/search'
  import { RAW_POEMS } from './data/poems'

  // モジュール初期化時に全 100 首の母音列を計算
  const poems: Poem[] = RAW_POEMS.map((p, i) => ({
    id: i + 1,
    text: p.text,
    author: p.author,
    reading: p.reading,
    vowels: kanaToVowels(p.reading),
  }))

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
        <div class="reading">{result.poem.reading}</div>
        <div class="vowels">{result.poem.vowels.join('')}</div>
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
</style>
