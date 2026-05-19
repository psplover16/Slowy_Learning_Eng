<template>
  <main class="max-w-3xl mx-auto px-4 py-6">
    <div class="mb-8">
      <h1 class="font-fraunces text-2xl font-semibold text-ink">文法參考
        <span class="block font-newsreader italic text-base font-normal text-ink-soft mt-1">Grammar Reference</span>
      </h1>
    </div>

    <!-- G01: Parts of Speech -->
    <GrammarCard badge="G01" title="英語常見詞性">
      <p class="text-ink-soft text-sm mb-3">認識詞性，是讀懂句子的第一步。每個詞性都有固定的「位置」和「功能」。</p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-teal-eng text-white text-left">
              <th class="px-3 py-2 rounded-tl-lg">縮寫</th>
              <th class="px-3 py-2">詞性（中文）</th>
              <th class="px-3 py-2">功能</th>
              <th class="px-3 py-2 rounded-tr-lg">例子</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in posTable" :key="row.abbr" :class="i % 2 === 1 ? 'bg-paper-2' : 'bg-paper-3'">
              <td class="px-3 py-2 font-newsreader font-medium text-teal-eng-deep">{{ row.abbr }}</td>
              <td class="px-3 py-2">{{ row.name }}</td>
              <td class="px-3 py-2 text-ink-soft">{{ row.role }}</td>
              <td class="px-3 py-2 font-newsreader italic text-ink-soft">{{ row.example }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </GrammarCard>

    <!-- G02: like usage -->
    <GrammarCard badge="G02" title="like 的全用法">
      <p class="text-ink-soft text-sm mb-4">like 是英語中「功能最多」的字之一，同一個字可以是動詞、介系詞或連接詞。</p>

      <div v-for="usage in likeUsages" :key="usage.role" class="mb-4 last:mb-0">
        <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-2 text-sm">
          {{ usage.formula }}
        </div>
        <p class="text-ink-soft text-sm mb-2">{{ usage.note }}</p>
        <ul class="space-y-1">
          <li v-for="ex in usage.examples" :key="ex.en" class="text-sm">
            <span class="font-newsreader italic text-terracotta-deep">{{ ex.en }}</span>
            <span class="text-ink-faint ml-2">{{ ex.tc }}</span>
          </li>
        </ul>
      </div>

      <div class="mt-4 bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm text-ink-soft">
        <span class="font-medium text-ink">注意：</span>like 在 feel like 後面接子句（完整句子），例如：
        <span class="font-newsreader italic text-terracotta-deep ml-1">It felt like I was in a movie.</span>
      </div>
    </GrammarCard>
  </main>
</template>

<script setup lang="ts">
import GrammarCard from '../../../shared/components/GrammarCard.vue'

const posTable = [
  { abbr: 'n.', name: '名詞 Noun', role: '人、事、物的名稱', example: 'airport, trip, memory' },
  { abbr: 'v.', name: '動詞 Verb', role: '描述動作或狀態', example: 'go, feel, bring' },
  { abbr: 'adj.', name: '形容詞 Adjective', role: '修飾名詞', example: 'beautiful, huge, nostalgic' },
  { abbr: 'adv.', name: '副詞 Adverb', role: '修飾動詞或形容詞', example: 'quickly, really, unnecessarily' },
  { abbr: 'prep.', name: '介系詞 Preposition', role: '表示關係（位置、時間、方式）', example: 'at, in, through, like' },
  { abbr: 'conj.', name: '連接詞 Conjunction', role: '連接句子或字詞', example: 'and, but, because, so' },
  { abbr: 'pron.', name: '代名詞 Pronoun', role: '代替名詞', example: 'I, we, they, it' },
]

const likeUsages = [
  {
    role: 'verb',
    formula: 'like + 名詞 / V-ing　（動詞：喜歡）',
    note: '表示「喜歡」，後面接名詞或動名詞（V-ing）。',
    examples: [
      { en: 'I like cookies.', tc: '我喜歡餅乾。' },
      { en: 'I like looking at the view.', tc: '我喜歡看那個景色。' },
    ],
  },
  {
    role: 'prep',
    formula: 'like + 名詞　（介系詞：像、如同）',
    note: '表示「相似、如同」，用來比較兩件事物。',
    examples: [
      { en: 'roads like the ones in America', tc: '像美國那樣的馬路' },
      { en: 'games like Jenga or tic-tac-toe', tc: '像疊疊樂或井字遊戲這類的遊戲' },
    ],
  },
  {
    role: 'conj',
    formula: 'feel like + 子句　（連接詞用法）',
    note: '接在 feel like 後面，後面是一個完整的句子，表示「感覺好像……」。',
    examples: [
      { en: 'It felt like I was in a movie.', tc: '感覺就像置身電影裡。' },
      { en: 'It feels like I used to live here.', tc: '感覺好像我以前住在這裡。' },
    ],
  },
]
</script>
