# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A static web app for searching the Ogura Hyakunin Isshu (小倉百人一首) by **phonetics** — users type a sequence of vowels (`a`/`i`/`u`/`e`/`o`) and the app returns matching poems. The poems are public domain and ship with the app as a bundled JSON database; there is no backend.

## Stack

- **Vite + Svelte + TypeScript**
- **GitHub Pages** for hosting, deployed via GitHub Actions
- No server, no API, no runtime data fetching beyond the bundled JSON

## Commands

Standard Vite commands once `package.json` exists:

- `npm run dev` — local dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

For GitHub Pages, `vite.config.ts` must set `base` to the repo path (e.g. `/hyakuninn-rhyme/`) so built asset URLs resolve correctly.

## Architecture

### Data pipeline

The 100 poems are stored as a single JSON file with **vowel sequences pre-computed at data-prep time**, not at runtime. Each entry holds:

- original text (kanji/kana)
- author
- kana reading
- vowel-only sequence (normalized to `aiueo` only)

Pre-computing the vowel sequence means the search hot path is plain string operations over a small (~100 entry) array — no kana-to-vowel conversion in the browser. Keep the data-prep step (whatever script generates this JSON) **separate** from the runtime app code; the runtime should never need a kana table.

Vowel normalization rules to settle before generating the JSON (and document in the data-prep script):

- long vowels (ー, あぁ, おう/おお, えい/えー) → how they collapse
- 拗音 (きゃ/しゅ/…) → the vowel of the second kana
- 撥音 ん, 促音 っ → likely dropped from the vowel stream (decide and be consistent)

### Search algorithm

The search is **fzf-style fuzzy matching over vowel sequences**, with two distinct kinds of looseness:

1. **Positional fuzziness**: the query's vowels must appear in order in the poem's vowel sequence, but **not contiguously** and **not anchored to the start**. (Same shape as fzf's subsequence match.)
2. **Phonetic fuzziness**: small mismatches in the vowels themselves are tolerated (e.g. near-vowels treated as partial matches). Tune which pairs are "close" empirically.

**Recall is preferred over precision.** With only 100 poems total, the cost of an extra false-positive candidate is low; the cost of hiding a real match is high. When tuning thresholds, prefer showing more candidates and let ranking surface the best ones. Rank by match quality (contiguity, fewer gaps, fewer phonetic substitutions) rather than filtering aggressively.

### Constraints

- **Static-only**: anything that needs a server (analytics endpoints, server-side rendering, dynamic data) is out of scope.
- **Simplicity over abstraction**: with 100 poems and one search box, resist building plugin systems, generic search frameworks, or premature optimization. Linear scan over 100 entries is fine.

## Data source

Ogura Hyakunin Isshu (小倉百人一首) — public domain. When sourcing the text, prefer a canonical reference and record where it came from in the data-prep script (or a comment near the JSON), since variants exist for some poems.
