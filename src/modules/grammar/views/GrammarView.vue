<template>
  <main class="max-w-3xl mx-auto px-4 py-6">
    <div class="mb-8">
      <h1 class="font-fraunces text-2xl font-semibold text-ink">文法參考
        <span class="block font-newsreader italic text-base font-normal text-ink-soft mt-1">Grammar Reference</span>
      </h1>
    </div>

    <!-- Section 1: 詞類基礎 -->
    <h2
      data-testid="grammar-section-header"
      class="font-fraunces text-xl font-semibold text-teal-eng-deep mt-8 mb-3 first:mt-0 pb-1 border-b border-line-soft"
    >1. 詞類基礎</h2>

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

    <!-- Section 2: 名詞片語家族 -->
    <h2
      data-testid="grammar-section-header"
      class="font-fraunces text-xl font-semibold text-teal-eng-deep mt-8 mb-3 first:mt-0 pb-1 border-b border-line-soft"
    >2. 名詞片語家族</h2>

    <!-- G02: Noun Phrases -->
    <GrammarCard badge="G02" title="名詞片語 Noun Phrase">
      <p class="text-ink-soft text-sm mb-4">名詞片語（Noun Phrase）是「以名詞為核心」的一組字詞。整體在句子中扮演名詞的功能，可以當主詞、受詞、補語等。</p>

      <div class="mb-4">
        <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-3 text-sm">
          結構：（限定詞）＋（前置修飾）＋ 名詞核心 ＋（後置修飾）
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-teal-eng text-white text-left">
                <th class="px-3 py-2 rounded-tl-lg">組成</th>
                <th class="px-3 py-2">說明</th>
                <th class="px-3 py-2 rounded-tr-lg">例子</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in nounPhraseStructure" :key="row.part" :class="i % 2 === 1 ? 'bg-paper-2' : 'bg-paper-3'">
                <td class="px-3 py-2 font-medium text-teal-eng-deep text-xs">{{ row.part }}</td>
                <td class="px-3 py-2 text-ink-soft">{{ row.desc }}</td>
                <td class="px-3 py-2 font-newsreader italic text-terracotta-deep">{{ row.example }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mb-4">
        <p class="text-sm font-medium text-ink mb-2">名詞片語在句中的功能</p>
        <ul class="space-y-2">
          <li v-for="fn in nounPhraseFunctions" :key="fn.role" class="text-sm flex items-start gap-2">
            <span class="shrink-0 inline-block bg-paper-2 border border-line rounded px-2 py-0.5 text-teal-eng-deep font-medium text-xs">{{ fn.role }}</span>
            <div>
              <span class="font-newsreader italic text-terracotta-deep">{{ fn.en }}</span>
              <span class="text-ink-faint ml-2">{{ fn.tc }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">關係子句作後置修飾時的省略規則</p>
        <p class="text-ink-soft text-xs mb-2">關係子句可以放在名詞後面來修飾它。此時的關係代名詞（that / who / which）有時候可以省略：</p>
        <div class="space-y-2 mt-2">
          <div class="text-sm">
            <span class="text-sage font-medium">✓ 可省略：</span>
            <span class="text-ink-soft">關係代名詞是關係子句中的「受詞」</span>
            <p class="font-newsreader italic text-terracotta-deep mt-0.5">The first thing (that) we did was head to bed.</p>
            <p class="text-ink-faint text-xs">→ "that" 是 "did" 的受詞，可省略</p>
          </div>
          <div class="text-sm">
            <span class="text-terracotta font-medium">✗ 不可省略：</span>
            <span class="text-ink-soft">關係代名詞是關係子句中的「主詞」</span>
            <p class="font-newsreader italic text-terracotta-deep mt-0.5">The book that was on the table.</p>
            <p class="text-ink-faint text-xs">→ "that" 是 "was" 的主詞，不可省略，省略後句子不完整</p>
          </div>
        </div>
      </div>
    </GrammarCard>

    <!-- G03: Relative Clauses -->
    <GrammarCard badge="G03" title="關係子句 Relative Clause">
      <p class="text-ink-soft text-sm mb-4">關係子句用來修飾名詞（先行詞），由「關係代名詞」引導，把兩個句子合併成一個更豐富的句子。</p>

      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-teal-eng text-white text-left">
              <th class="px-3 py-2 rounded-tl-lg">代名詞</th>
              <th class="px-3 py-2">用於</th>
              <th class="px-3 py-2 rounded-tr-lg">例句</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in relativePronouns" :key="row.pronoun" :class="i % 2 === 1 ? 'bg-paper-2' : 'bg-paper-3'">
              <td class="px-3 py-2 font-newsreader font-bold text-teal-eng-deep">{{ row.pronoun }}</td>
              <td class="px-3 py-2 text-ink-soft">{{ row.usage }}</td>
              <td class="px-3 py-2 font-newsreader italic text-terracotta-deep">{{ row.example }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-4 space-y-2">
        <p class="text-sm font-medium text-ink">省略規則</p>
        <div v-for="rule in relativeOmissionRules" :key="rule.example" class="bg-paper-2 rounded-lg px-3 py-2 text-sm">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium" :class="rule.canOmit ? 'text-sage' : 'text-terracotta'">
              {{ rule.canOmit ? '✓ 可省略' : '✗ 不可省略' }}
            </span>
            <span class="text-ink-soft text-xs">{{ rule.condition }}</span>
          </div>
          <p class="font-newsreader italic text-terracotta-deep text-sm">{{ rule.example }}</p>
          <p class="text-ink-faint text-xs mt-0.5">{{ rule.note }}</p>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">特殊用法：主詞含有 do／did，補語可用原形動詞</p>
        <p class="text-ink-soft text-xs mb-2">當名詞片語主詞含有「do / did」，be 動詞後的補語可以直接用原形動詞（不加 to）：</p>
        <div class="space-y-1">
          <p class="font-newsreader italic text-terracotta-deep">The first thing we did was <span class="underline">head</span> to bed. ✓</p>
          <p class="font-newsreader italic text-terracotta-deep">The first thing we did was <span class="underline">to head</span> to bed. ✓</p>
          <p class="text-ink-faint text-xs">兩種都正確。口語常用前者（不加 to）。</p>
        </div>
      </div>
    </GrammarCard>

    <!-- G04: Participial Phrases -->
    <GrammarCard badge="G04" title="分詞片語 Participial Phrase">
      <p class="text-ink-soft text-sm mb-4">分詞片語用「現在分詞（V-ing）」或「過去分詞（V-pp）」為核心，補充說明名詞或主要子句，功能類似形容詞子句或副詞子句，但更簡潔。</p>

      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-teal-eng text-white text-left">
              <th class="px-3 py-2 rounded-tl-lg">種類</th>
              <th class="px-3 py-2">形式</th>
              <th class="px-3 py-2">含意</th>
              <th class="px-3 py-2 rounded-tr-lg">例子</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in participleTypes" :key="row.type" :class="i % 2 === 1 ? 'bg-paper-2' : 'bg-paper-3'">
              <td class="px-3 py-2 font-medium text-teal-eng-deep text-xs">{{ row.type }}</td>
              <td class="px-3 py-2 font-newsreader italic">{{ row.form }}</td>
              <td class="px-3 py-2 text-ink-soft">{{ row.meaning }}</td>
              <td class="px-3 py-2 font-newsreader italic text-terracotta-deep">{{ row.example }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mb-4">
        <p class="text-sm font-medium text-ink mb-2">課文例句解析</p>
        <div class="space-y-3">
          <div v-for="ex in participleExamples" :key="ex.sentence" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
            <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.sentence }}</p>
            <p class="text-ink-soft text-xs">{{ ex.analysis }}</p>
          </div>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-1">⚠ 注意：懸垂分詞（Dangling Participle）</p>
        <p class="text-ink-soft text-xs mb-2">分詞片語的「隱含主詞」必須和主要子句的主詞相同，否則語意會錯亂：</p>
        <p class="font-newsreader italic text-terracotta text-xs">❌ Walking down the street, the rain started.</p>
        <p class="text-ink-faint text-xs mb-1">（語意：雨在走路？）</p>
        <p class="font-newsreader italic text-sage text-xs">✓ Walking down the street, I got caught in the rain.</p>
        <p class="text-ink-faint text-xs">（主詞 I 跟分詞片語的主詞一致）</p>
      </div>
    </GrammarCard>

    <!-- Section 3: 動詞時態 -->
    <h2
      data-testid="grammar-section-header"
      class="font-fraunces text-xl font-semibold text-teal-eng-deep mt-8 mb-3 first:mt-0 pb-1 border-b border-line-soft"
    >3. 動詞時態</h2>

    <!-- G05: used to + V -->
    <GrammarCard badge="G05" title="used to + V　過去曾經……">
      <p class="text-ink-soft text-sm mb-4">「used to + V」表示「過去曾經（習慣）做某事，但現在已經不了」，強調跟現在的對比。</p>

      <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-4 text-sm">
        公式：used to ＋ 原形動詞（V）
      </div>

      <div class="space-y-2 mb-4">
        <div v-for="ex in usedToExamples" :key="ex.en" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.en }}</p>
          <p class="text-ink-soft">{{ ex.tc }}</p>
          <p class="text-ink-faint text-xs mt-1">{{ ex.note }}</p>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">⚠ 容易混淆的三種形式</p>
        <div class="space-y-2">
          <div v-for="form in usedToForms" :key="form.form" class="text-sm">
            <span class="font-newsreader italic text-teal-eng-deep font-medium">{{ form.form }}</span>
            <span class="text-ink-soft ml-2">→ {{ form.meaning }}</span>
            <p class="font-newsreader italic text-terracotta-deep text-xs mt-0.5 ml-2">{{ form.example }}</p>
          </div>
        </div>
      </div>
    </GrammarCard>

    <!-- G06: Present Perfect vs Present Perfect Progressive -->
    <GrammarCard badge="G06" title="現在完成式 vs 現在完成進行式">
      <p class="text-ink-soft text-sm mb-4">兩者都表示「從過去開始、與現在有關」的事，差別在於強調「結果/經驗」還是「動作持續進行中」。</p>

      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-teal-eng text-white text-left">
              <th class="px-3 py-2 rounded-tl-lg">時態</th>
              <th class="px-3 py-2">公式</th>
              <th class="px-3 py-2 rounded-tr-lg">強調重點</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-paper-3">
              <td class="px-3 py-2 font-medium text-teal-eng-deep">現在完成式</td>
              <td class="px-3 py-2 font-newsreader italic">have / has ＋ V-pp</td>
              <td class="px-3 py-2 text-ink-soft">已完成的結果、過去的經驗</td>
            </tr>
            <tr class="bg-paper-2">
              <td class="px-3 py-2 font-medium text-teal-eng-deep">現在完成進行式</td>
              <td class="px-3 py-2 font-newsreader italic">have / has been ＋ V-ing</td>
              <td class="px-3 py-2 text-ink-soft">動作一直持續到現在，還在進行</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 mb-4">
        <div v-for="tense in presentPerfectExamples" :key="tense.type" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="font-medium text-ink mb-2">{{ tense.type }}</p>
          <ul class="space-y-1.5">
            <li v-for="ex in tense.examples" :key="ex.en">
              <p class="font-newsreader italic text-terracotta-deep">{{ ex.en }}</p>
              <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm text-ink-soft">
        <p class="font-medium text-ink mb-1">常用搭配詞</p>
        <ul class="space-y-1 text-xs">
          <li><span class="font-newsreader italic text-teal-eng-deep">for ＋ 時間長度</span>　持續多久：I've lived here for two years.</li>
          <li><span class="font-newsreader italic text-teal-eng-deep">since ＋ 時間點</span>　從…開始：She's been here since Monday.</li>
          <li><span class="font-newsreader italic text-teal-eng-deep">ever</span>　曾經（疑問句）：Have you ever been to Paris?</li>
          <li><span class="font-newsreader italic text-teal-eng-deep">never</span>　從未：I've never tried sushi.</li>
          <li><span class="font-newsreader italic text-teal-eng-deep">already</span>　已經：I've already eaten.</li>
          <li><span class="font-newsreader italic text-teal-eng-deep">yet</span>　尚未（否定/疑問）：Have you finished yet?</li>
        </ul>
      </div>
    </GrammarCard>

    <!-- G07: Perfect Infinitive -->
    <GrammarCard badge="G07" title="不定詞完成式 to have + V-pp">
      <p class="text-ink-soft text-sm mb-4">「不定詞完成式」用來表示一個動作發生在主要動詞的時間<strong>之前</strong>，強調「回顧過去已發生的事」。</p>

      <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-4 text-sm">
        公式：to have ＋ 過去分詞（V-pp）
      </div>

      <div class="space-y-3 mb-4">
        <div v-for="ex in perfectInfinitiveExamples" :key="ex.en" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.en }}</p>
          <p class="text-ink-soft">{{ ex.tc }}</p>
          <p class="text-ink-faint text-xs mt-1">{{ ex.note }}</p>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">對比：普通不定詞 vs 不定詞完成式</p>
        <div class="space-y-2">
          <div>
            <p class="font-newsreader italic text-terracotta-deep">I'm glad to meet you.</p>
            <p class="text-ink-faint text-xs">→ 普通不定詞：此刻正在發生的事</p>
          </div>
          <div>
            <p class="font-newsreader italic text-terracotta-deep">I'm glad to have met you.</p>
            <p class="text-ink-faint text-xs">→ 不定詞完成式：過去已發生，現在回頭看感到高興</p>
          </div>
        </div>
      </div>
    </GrammarCard>

    <!-- G19: Three Natural Future Forms -->
    <GrammarCard badge="G19" title="三種自然未來式：going to / 現在進行式 / will">
      <p class="text-ink-soft text-sm mb-4">英語表達未來有三種常用方式，選擇哪一種取決於「是否已決定」和「計畫有多具體」。</p>

      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-teal-eng text-white text-left">
              <th class="px-3 py-2 rounded-tl-lg">形式</th>
              <th class="px-3 py-2">公式</th>
              <th class="px-3 py-2 rounded-tr-lg">用法</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in futureFormsTable" :key="row.form" :class="i % 2 === 1 ? 'bg-paper-2' : 'bg-paper-3'">
              <td class="px-3 py-2 font-medium text-teal-eng-deep">{{ row.form }}</td>
              <td class="px-3 py-2 font-newsreader italic">{{ row.formula }}</td>
              <td class="px-3 py-2 text-ink-soft">{{ row.usage }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3 mb-4">
        <div v-for="row in futureFormsTable" :key="row.form + '-examples'" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="font-medium text-ink mb-2">{{ row.form }}</p>
          <div class="space-y-1.5">
            <div v-for="ex in row.examples" :key="ex.en">
              <p class="font-newsreader italic text-terracotta-deep">{{ ex.en }}</p>
              <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm text-ink-soft">
        <p class="font-medium text-ink mb-2">補充說明</p>
        <ul class="space-y-1.5 text-xs">
          <li>🔹 <span class="font-newsreader italic text-teal-eng-deep">be going to</span> 與現在進行式都可表達「計畫」，但 be going to 較常用於「決定但尚未安排細節」的情境。</li>
          <li>🔹 <span class="font-newsreader italic text-teal-eng-deep">will</span> 通常不用來表達「已計畫好的事」，改用 be going to 或現在進行式更自然。</li>
          <li>🔹 口語中常將 <span class="font-newsreader italic text-teal-eng-deep">I'm going to</span> 縮讀為 "I'm gonna"，書面仍以完整形式為主。</li>
          <li>🔹 問句同樣遵循此三者的邏輯：<span class="font-newsreader italic text-terracotta-deep">Are you going to ...? / Are you ...ing? / Will you ...?</span></li>
        </ul>
      </div>
    </GrammarCard>

    <!-- Section 4: V-ing 後接慣例 -->
    <h2
      data-testid="grammar-section-header"
      class="font-fraunces text-xl font-semibold text-teal-eng-deep mt-8 mb-3 first:mt-0 pb-1 border-b border-line-soft"
    >4. V-ing 後接慣例</h2>

    <!-- G08: Preposition + Gerund -->
    <GrammarCard badge="G08" title="介系詞後面一定接 V-ing（動名詞）">
      <p class="text-ink-soft text-sm mb-4">在英語中，介系詞（at / for / of / in / without / instead of…）後面<strong>不能接原形動詞</strong>，必須接「動名詞（V-ing）」。</p>

      <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-4 text-sm">
        規則：介系詞 ＋ V-ing（動名詞）
      </div>

      <div class="space-y-2 mb-4">
        <div v-for="ex in prepositionGerundExamples" :key="ex.en" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.en }}</p>
          <p class="text-ink-soft text-xs">{{ ex.tc }}</p>
          <p class="text-ink-faint text-xs mt-0.5">{{ ex.note }}</p>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">常見「介系詞 ＋ V-ing」組合</p>
        <ul class="grid grid-cols-2 gap-1 text-xs text-ink-soft">
          <li v-for="combo in prepositionCombos" :key="combo">
            <span class="font-newsreader italic text-teal-eng-deep">{{ combo }}</span>
          </li>
        </ul>
      </div>
    </GrammarCard>

    <!-- G09: while + V-ing -->
    <GrammarCard badge="G09" title="while ＋ V-ing　同時進行">
      <p class="text-ink-soft text-sm mb-4">「while ＋ V-ing」是 「while ＋ 子句」的省略形式，表示「在做某事的同時」或「當……的時候」。</p>

      <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-4 text-sm">
        公式：while ＋ V-ing（省略了與主要子句相同的主詞 ＋ be 動詞）
      </div>

      <div class="space-y-2 mb-4">
        <div v-for="ex in whileExamples" :key="ex.full" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="text-ink-soft text-xs mb-1">完整形式：</p>
          <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.full }}</p>
          <p class="text-ink-soft text-xs mb-1">省略後：</p>
          <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.short }}</p>
          <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm text-xs text-ink-soft">
        <span class="font-medium text-ink">注意：</span>省略後的主詞必須與主要子句相同，否則語意會出錯。
      </div>
    </GrammarCard>

    <!-- Section 5: 從屬子句與時間 -->
    <h2
      data-testid="grammar-section-header"
      class="font-fraunces text-xl font-semibold text-teal-eng-deep mt-8 mb-3 first:mt-0 pb-1 border-b border-line-soft"
    >5. 從屬子句與時間</h2>

    <!-- G10: for + duration -->
    <GrammarCard badge="G10" title="for ＋ 時間長度　持續多久">
      <p class="text-ink-soft text-sm mb-4">for ＋ 時間長度，用來說明一個動作或狀態「持續了多長時間」，中文是「……了多久」。</p>

      <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-4 text-sm">
        公式：for ＋ 時間長度（a week / two days / a while…）
      </div>

      <div class="mb-4 space-y-2">
        <div v-for="ex in forDurationExamples" :key="ex.en" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.en }}</p>
          <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">for vs since 的對比</p>
        <div class="space-y-1.5 text-xs">
          <div>
            <span class="font-newsreader italic text-teal-eng-deep">for ＋ 時間長度</span>
            <span class="text-ink-soft ml-1">→ 持續了多久（段落）</span>
            <p class="font-newsreader italic text-terracotta-deep ml-2">I've lived here for three years.</p>
          </div>
          <div>
            <span class="font-newsreader italic text-teal-eng-deep">since ＋ 時間點</span>
            <span class="text-ink-soft ml-1">→ 從什麼時候開始（起點）</span>
            <p class="font-newsreader italic text-terracotta-deep ml-2">I've lived here since 2021.</p>
          </div>
        </div>
      </div>
    </GrammarCard>

    <!-- G11: if 的雙重用法 -->
    <GrammarCard badge="G11" title="if 的雙重用法：如果 vs 是否">
      <p class="text-ink-soft text-sm mb-4">if 在英語中有兩種完全不同的用法，要看句子結構來判斷。</p>

      <div class="space-y-3 mb-4">
        <div v-for="usage in ifUsages" :key="usage.type" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <div class="inline-block bg-teal-eng text-white font-newsreader rounded px-2 py-0.5 mb-2 text-xs">
            {{ usage.type }}
          </div>
          <p class="text-ink-soft text-xs mb-2">{{ usage.desc }}</p>
          <ul class="space-y-1">
            <li v-for="ex in usage.examples" :key="ex.en">
              <p class="font-newsreader italic text-terracotta-deep text-sm">{{ ex.en }}</p>
              <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">if vs whether 的差異</p>
        <div class="space-y-1.5 text-xs text-ink-soft">
          <p>用在 know / wonder / ask / not sure 後面表示「是否」時，<span class="font-newsreader italic text-teal-eng-deep">if</span> 和 <span class="font-newsreader italic text-teal-eng-deep">whether</span> 通常可以互換。</p>
          <p class="font-newsreader italic text-terracotta-deep">I don't know if / whether he's coming.</p>
          <p>但以下情況只能用 <span class="font-newsreader italic text-teal-eng-deep">whether</span>：</p>
          <ul class="list-disc list-inside space-y-0.5 text-ink-faint">
            <li>接 or not 時：I don't know whether or not he's coming.</li>
            <li>放在句首時：Whether he comes or not doesn't matter.</li>
            <li>當介系詞受詞時：It depends on whether you're ready.</li>
          </ul>
        </div>
      </div>
    </GrammarCard>

    <!-- G12: so that -->
    <GrammarCard badge="G12" title="so that　目的／結果子句">
      <p class="text-ink-soft text-sm mb-4">「so that ＋ 子句」有兩種用法：表示「目的」（好讓…、為了…）或「結果」（結果…）。</p>

      <div class="space-y-3 mb-4">
        <div v-for="usage in soThatUsages" :key="usage.type" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <div class="inline-block bg-teal-eng text-white font-newsreader rounded px-2 py-0.5 mb-2 text-xs">
            {{ usage.type }}
          </div>
          <p class="text-ink-soft text-xs mb-2">{{ usage.desc }}</p>
          <ul class="space-y-1">
            <li v-for="ex in usage.examples" :key="ex.en">
              <p class="font-newsreader italic text-terracotta-deep">{{ ex.en }}</p>
              <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm text-ink-soft text-xs">
        <span class="font-medium text-ink">課文例句：</span>
        <p class="font-newsreader italic text-terracotta-deep mt-1">...getting you to pay attention to the show so that behind you they can take your wallets.</p>
        <p class="mt-1">→ so that 表示「目的」：故意讓你看表演，好讓他們趁機扒竊。</p>
        <p>→ behind you 倒裝到句首是口語強調，正常語序是：so that they can take your wallets behind you.</p>
      </div>
    </GrammarCard>

    <!-- Section 6: 多功能動詞 -->
    <h2
      data-testid="grammar-section-header"
      class="font-fraunces text-xl font-semibold text-teal-eng-deep mt-8 mb-3 first:mt-0 pb-1 border-b border-line-soft"
    >6. 多功能動詞</h2>

    <!-- G13: Causative Verbs -->
    <GrammarCard badge="G13" title="使役動詞 make / have / get / let">
      <p class="text-ink-soft text-sm mb-4">使役動詞表示「讓/叫/允許某人做某事」，四個動詞語氣不同，後面接法也有差異。</p>

      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-teal-eng text-white text-left">
              <th class="px-3 py-2 rounded-tl-lg">動詞</th>
              <th class="px-3 py-2">公式</th>
              <th class="px-3 py-2">含意</th>
              <th class="px-3 py-2 rounded-tr-lg">例句</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in causativeVerbs" :key="row.verb" :class="i % 2 === 1 ? 'bg-paper-2' : 'bg-paper-3'">
              <td class="px-3 py-2 font-newsreader font-bold text-teal-eng-deep text-base">{{ row.verb }}</td>
              <td class="px-3 py-2 font-newsreader italic text-xs">{{ row.formula }}</td>
              <td class="px-3 py-2 text-ink-soft">{{ row.meaning }}</td>
              <td class="px-3 py-2 font-newsreader italic text-terracotta-deep text-xs">{{ row.example }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm">
        <p class="font-medium text-ink mb-2">記憶口訣</p>
        <ul class="space-y-1 text-xs text-ink-soft">
          <li><span class="font-medium text-ink">make</span>：強迫（對方沒有選擇）→ 接<span class="font-newsreader italic"> 原形動詞</span></li>
          <li><span class="font-medium text-ink">have</span>：指派、安排（中性，職責分配）→ 接<span class="font-newsreader italic"> 原形動詞</span></li>
          <li><span class="font-medium text-ink">get</span>：說服、促使（需要溝通努力）→ 接<span class="font-newsreader italic"> to + V</span>（唯一一個！）</li>
          <li><span class="font-medium text-ink">let</span>：允許（給予許可）→ 接<span class="font-newsreader italic"> 原形動詞</span></li>
        </ul>
      </div>
    </GrammarCard>

    <!-- G14: get usage -->
    <GrammarCard badge="G14" title="get 的各種用法">
      <p class="text-ink-soft text-sm mb-4">get 是英語中最常用的字之一，根據後面接什麼，意思完全不同。</p>

      <div class="space-y-3 mb-4">
        <div v-for="usage in getUsages" :key="usage.pattern" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <div class="flex items-center gap-2 mb-1">
            <div class="inline-block bg-teal-eng text-white font-newsreader rounded px-2 py-0.5 text-xs">
              {{ usage.pattern }}
            </div>
            <span class="text-ink-soft text-xs">→ {{ usage.meaning }}</span>
          </div>
          <ul class="space-y-0.5 mt-1">
            <li v-for="ex in usage.examples" :key="ex.en">
              <span class="font-newsreader italic text-terracotta-deep text-xs">{{ ex.en }}</span>
              <span class="text-ink-faint text-xs ml-2">{{ ex.tc }}</span>
            </li>
          </ul>
        </div>
      </div>
    </GrammarCard>

    <!-- G15: like usage -->
    <GrammarCard badge="G15" title="like 的全用法">
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

    <!-- G16: prefer -->
    <GrammarCard badge="G16" title="prefer 偏好表達">
      <p class="text-ink-soft text-sm mb-4">prefer 表示「比較喜歡、偏好」，有三種常用句型。</p>

      <div class="space-y-3 mb-4">
        <div v-for="pattern in preferPatterns" :key="pattern.formula" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <div class="inline-block bg-teal-eng text-white font-newsreader rounded px-2 py-0.5 mb-2 text-xs">
            {{ pattern.formula }}
          </div>
          <p class="text-ink-soft text-xs mb-2">{{ pattern.desc }}</p>
          <ul class="space-y-1">
            <li v-for="ex in pattern.examples" :key="ex.en">
              <p class="font-newsreader italic text-terracotta-deep">{{ ex.en }}</p>
              <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
            </li>
          </ul>
        </div>
      </div>
    </GrammarCard>

    <!-- Section 7: 語氣與比較 -->
    <h2
      data-testid="grammar-section-header"
      class="font-fraunces text-xl font-semibold text-teal-eng-deep mt-8 mb-3 first:mt-0 pb-1 border-b border-line-soft"
    >7. 語氣與比較</h2>

    <!-- G17: ever -->
    <GrammarCard badge="G17" title="ever 的語氣加強用法">
      <p class="text-ink-soft text-sm mb-4">ever 字面是「曾經、在任何時候」，但更常見的功能是<strong>加強語氣</strong>，常出現在三種場合。</p>

      <div class="space-y-3 mb-4">
        <div v-for="usage in everUsages" :key="usage.context" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <div class="inline-block bg-teal-eng text-white font-newsreader rounded px-2 py-0.5 mb-2 text-xs">
            {{ usage.context }}
          </div>
          <p class="text-ink-soft text-xs mb-2">{{ usage.desc }}</p>
          <ul class="space-y-1">
            <li v-for="ex in usage.examples" :key="ex.en">
              <p class="font-newsreader italic text-terracotta-deep">{{ ex.en }}</p>
              <p class="text-ink-faint text-xs">{{ ex.tc }}</p>
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm text-ink-soft text-xs">
        <span class="font-medium text-ink">注意：</span>
        <span class="font-newsreader italic text-teal-eng-deep">not...ever</span> ＝ <span class="font-newsreader italic text-teal-eng-deep">never</span>（語意相同）
        <p class="font-newsreader italic text-terracotta-deep mt-1">I haven't ever been there. ＝ I've never been there.</p>
      </div>
    </GrammarCard>

    <!-- G18: just as...as -->
    <GrammarCard badge="G18" title="just as...as　同等比較">
      <p class="text-ink-soft text-sm mb-4">「just as ＋ 形容詞／副詞 ＋ as」表示「和……一樣……」，強調兩者程度完全相同。</p>

      <div class="inline-block bg-teal-eng text-white font-newsreader rounded-lg px-3 py-1.5 mb-4 text-sm">
        公式：just as ＋ 形容詞 ＋ as ＋ 名詞／子句
      </div>

      <div class="space-y-2 mb-4">
        <div v-for="ex in justAsExamples" :key="ex.en" class="bg-paper-2 rounded-lg px-4 py-3 text-sm">
          <p class="font-newsreader italic text-terracotta-deep mb-1">{{ ex.en }}</p>
          <p class="text-ink-soft text-xs">{{ ex.tc }}</p>
          <p class="text-ink-faint text-xs mt-0.5">{{ ex.note }}</p>
        </div>
      </div>

      <div class="bg-paper-2 border border-line-soft rounded-lg px-4 py-3 text-sm text-ink-soft text-xs">
        <span class="font-medium text-ink">對比：</span>
        <span class="font-newsreader italic text-teal-eng-deep">as...as</span> 也表示同等比較，just 是加強語氣（「就和……一樣」），可省略。
        <p class="font-newsreader italic text-terracotta-deep mt-1">The takeoff was just as beautiful as the landing.</p>
        <p>→ 起飛和降落一樣美（就和……一樣美）</p>
      </div>
    </GrammarCard>
  </main>
</template>

<script setup lang="ts">
import GrammarCard from '../../../shared/components/GrammarCard.vue'

// G01
const posTable = [
  { abbr: 'n.', name: '名詞 Noun', role: '人、事、物的名稱', example: 'airport, trip, memory' },
  { abbr: 'v.', name: '動詞 Verb', role: '描述動作或狀態', example: 'go, feel, bring' },
  { abbr: 'adj.', name: '形容詞 Adjective', role: '修飾名詞', example: 'beautiful, huge, nostalgic' },
  { abbr: 'adv.', name: '副詞 Adverb', role: '修飾動詞或形容詞', example: 'quickly, really, unnecessarily' },
  { abbr: 'prep.', name: '介系詞 Preposition', role: '表示關係（位置、時間、方式）', example: 'at, in, through, like' },
  { abbr: 'conj.', name: '連接詞 Conjunction', role: '連接句子或字詞', example: 'and, but, because, so' },
  { abbr: 'pron.', name: '代名詞 Pronoun', role: '代替名詞', example: 'I, we, they, it' },
]

// G02
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

// G03
const nounPhraseStructure = [
  { part: '限定詞 Det.', desc: 'a, the, my, this, some…（非必要）', example: 'the / my / a' },
  { part: '前置修飾（形容詞）', desc: '放在名詞前面修飾', example: 'beautiful, first, long' },
  { part: '名詞核心 N.', desc: '整個片語的中心詞', example: 'thing, city, memory' },
  { part: '後置修飾', desc: '介系詞片語、關係子句、分詞片語，放在名詞後面', example: '(that) we did, in New York' },
]

const nounPhraseFunctions = [
  { role: '主詞', en: 'The first thing we did was amazing.', tc: '我們做的第一件事很了不起。' },
  { role: '受詞', en: 'I saw a beautiful sunset.', tc: '我看到了美麗的日落。' },
  { role: '主詞補語', en: 'She is a talented singer.', tc: '她是個有才華的歌手。' },
  { role: '介系詞受詞', en: "I've been dreaming of this moment.", tc: '我一直夢想著這個時刻。' },
]

// G04
const relativePronouns = [
  { pronoun: 'that', usage: '人或事物（通用）', example: 'The thing that happened...' },
  { pronoun: 'which', usage: '事物（非限定用法較常用）', example: 'The park, which was huge...' },
  { pronoun: 'who', usage: '人（主詞位置）', example: 'beginners who want to practice listening to English' },
  { pronoun: 'whom', usage: '人（受詞位置，較正式）', example: 'The person whom I met.' },
  { pronoun: 'where', usage: '地方', example: "The city where I grew up." },
]

const relativeOmissionRules = [
  {
    canOmit: true,
    condition: '關係代名詞是子句中的受詞',
    example: 'The first thing (that) we did was head to bed.',
    note: '"that" 是 "did" 的受詞，省略後句子仍完整',
  },
  {
    canOmit: true,
    condition: '關係代名詞是子句中的受詞',
    example: "One story (that) you feel grateful for having as a kid.",
    note: '"that" 是 "feel grateful for having" 的受詞',
  },
  {
    canOmit: false,
    condition: '關係代名詞是子句中的主詞',
    example: 'The book that was on the table is mine.',
    note: '"that" 是 "was" 的主詞，省略後 "was on the table" 變成懸空片語',
  },
  {
    canOmit: false,
    condition: '非限定關係子句（有逗號）',
    example: 'Paris, which is in France, is beautiful.',
    note: '逗號隔開的關係子句不可省略關係代名詞',
  },
]

// G05
const usedToExamples = [
  {
    en: 'I used to live in Taipei.',
    tc: '我以前住在台北（但現在不住了）。',
    note: '過去的習慣或狀態，現在已改變',
  },
  {
    en: "There used to be a park here.",
    tc: '這裡以前有一座公園。',
    note: '過去存在的事物，現在已不存在',
  },
]

const usedToForms = [
  {
    form: 'used to + V',
    meaning: '過去曾經……（現在不了）',
    example: 'I used to go there every weekend.',
  },
  {
    form: 'be used to + V-ing',
    meaning: '習慣（現在的習慣）',
    example: "I'm used to waking up early.",
  },
  {
    form: 'get used to + V-ing',
    meaning: '逐漸習慣（過程）',
    example: "I'm getting used to the cold.",
  },
]

// G06
const presentPerfectExamples = [
  {
    type: '現在完成式：have / has + V-pp',
    examples: [
      { en: 'I have been obsessed with this place.', tc: '我一直對這個地方著迷（強調狀態）。' },
      { en: 'Have you ever been to New York?', tc: '你曾去過紐約嗎？（強調經驗）' },
      { en: "The best pizza that I've ever had.", tc: '我這輩子吃過最好的披薩。' },
    ],
  },
  {
    type: '現在完成進行式：have / has been + V-ing',
    examples: [
      { en: "I've been dreaming of this moment for so long.", tc: '我夢想著這個時刻已經好久了（強調持續進行）。' },
      { en: "She's been working here since 2020.", tc: '她從 2020 年就一直在這裡工作。' },
    ],
  },
]

// G07
const perfectInfinitiveExamples = [
  {
    en: 'I feel lucky to have had such a beautiful childhood.',
    tc: '我覺得自己很幸運，曾經擁有那麼美好的童年。',
    note: '"to have had" 表示「擁有童年」這件事早於現在的「feel lucky」',
  },
  {
    en: "She seems to have forgotten my name.",
    tc: '她似乎已經忘記我的名字了。',
    note: '「忘記」發生在「似乎」之前',
  },
  {
    en: "I'm glad to have met you.",
    tc: '很高興曾經認識你。',
    note: '「認識」是過去的事，「高興」是現在的感受',
  },
]

// G19
const futureFormsTable = [
  {
    form: 'be going to',
    formula: 'am / is / are + going to + V',
    usage: '已決定的計畫；有明顯跡象的預測',
    examples: [
      { en: "I'm going to study abroad next year.", tc: '我明年打算出國讀書。（已決定的計畫）' },
      { en: "Look at those clouds — it's going to rain.", tc: '你看那些雲——要下雨了。（有跡象的預測）' },
    ],
  },
  {
    form: '現在進行式',
    formula: 'am / is / are + V-ing',
    usage: '已安排好的計畫（有時間、地點等具體安排）',
    examples: [
      { en: "I'm meeting Sarah at 3 pm tomorrow.", tc: '我明天下午三點要和莎拉見面。（已排定）' },
      { en: "We're flying to Tokyo next Monday.", tc: '我們下週一要飛去東京。（機票已訂）' },
    ],
  },
  {
    form: 'will',
    formula: 'will + V',
    usage: '當下決定、承諾、預測（無具體跡象）',
    examples: [
      { en: "I'll help you with that.", tc: '我來幫你。（臨時決定）' },
      { en: "She'll probably be late.", tc: '她可能會遲到。（一般性預測）' },
    ],
  },
]

// G08
const prepositionGerundExamples = [
  {
    en: 'One story that you feel grateful for having as a kid.',
    tc: '一個你小時候很慶幸擁有過的故事。',
    note: 'for + having（介系詞 for 後面接動名詞）',
  },
  {
    en: 'instead of chopping down the tree',
    tc: '而不是把樹砍掉',
    note: 'instead of 是複合介系詞，後面接 V-ing',
  },
  {
    en: "I'm not good at speaking English.",
    tc: '我不擅長說英文。',
    note: 'at + speaking（介系詞後接動名詞）',
  },
  {
    en: 'Thank you for coming.',
    tc: '謝謝你來。',
    note: 'for + coming',
  },
]

const prepositionCombos = [
  'for + V-ing（感謝、目的）',
  'at + V-ing（擅長/不擅長）',
  'of + V-ing（恐懼、期待等）',
  'in + V-ing（在…過程中）',
  'without + V-ing（沒有做…）',
  'instead of + V-ing（而不是）',
  'before / after + V-ing',
  'by + V-ing（透過…方式）',
]

// G09
const participleTypes = [
  { type: '現在分詞片語', form: 'V-ing', meaning: '主動、進行中的動作', example: 'getting you to pay attention' },
  { type: '過去分詞片語', form: 'V-pp', meaning: '被動、已完成的狀態', example: 'all torn apart everywhere' },
]

const participleExamples = [
  {
    sentence: '...getting you to pay attention to the show so that behind you they can take your wallets.',
    analysis: '「getting you to pay attention」是現在分詞片語，補充說明前面 scamming people 的手法——讓你盯著表演看，好在背後行竊。',
  },
  {
    sentence: 'The car was all torn apart everywhere for some weird reason.',
    analysis: '「all torn apart everywhere」是過去分詞片語，描述車子被拆得亂七八糟的「狀態」（被動、已發生）。',
  },
  {
    sentence: 'It felt like I was in a movie eating a salted pretzel in New York.',
    analysis: '「eating a salted pretzel in New York」是現在分詞片語，修飾前面的主詞 I，描述當時正在做的動作。',
  },
]

// G10
const causativeVerbs = [
  { verb: 'make', formula: 'make + O + V（原形）', meaning: '強迫（對方無選擇）', example: 'The movie made me cry.' },
  { verb: 'have', formula: 'have + O + V（原形）', meaning: '指派、安排（中性）', example: "I'll have him fix the car." },
  { verb: 'get', formula: 'get + O + to V（不定詞）', meaning: '說服、促使（需溝通）', example: 'She got me to pay attention.' },
  { verb: 'let', formula: 'let + O + V（原形）', meaning: '允許（給予許可）', example: 'Let me know if you need help.' },
]

// G11
const ifUsages = [
  {
    type: '用法一：如果（條件句）',
    desc: '表示假設或條件，如果…就…',
    examples: [
      { en: 'If it rains, I will stay home.', tc: '如果下雨，我就待在家。' },
      { en: 'If you go, I will go too.', tc: '如果你去，我也去。' },
    ],
  },
  {
    type: '用法二：是否、是不是（間接問句）',
    desc: '接在 know / wonder / ask / not sure 這類動詞後面，引出一個是非問題。',
    examples: [
      { en: "I don't know if I was scammed.", tc: '我不知道我是不是被騙了。' },
      { en: "I'm not sure if he's coming.", tc: '我不確定他是否會來。' },
      { en: 'She asked if I liked the food.', tc: '她問我喜不喜歡那食物。' },
    ],
  },
]

// G12
const soThatUsages = [
  {
    type: '表示目的（好讓…、為了…）',
    desc: '後面常接 can / could / will / would，說明做某事的目的。',
    examples: [
      { en: 'I left early so that I could catch the bus.', tc: '我提早離開，好趕上公車。' },
      { en: 'She spoke slowly so that we could understand.', tc: '她說話放慢，好讓我們聽懂。' },
    ],
  },
  {
    type: '表示結果（結果…、因此…）',
    desc: '說明前面動作造成的結果，後面不一定接 can / could。',
    examples: [
      { en: 'He was tired, so that he fell asleep quickly.', tc: '他很疲倦，因此很快就睡著了。' },
    ],
  },
]

// G13
const everUsages = [
  {
    context: '疑問句（曾經嗎？）',
    desc: '問對方是否曾有某個經驗',
    examples: [
      { en: 'Have you ever been to Canes?', tc: '你曾去過 Canes 嗎？' },
      { en: 'Have you ever tried this?', tc: '你有沒有試過這個？' },
    ],
  },
  {
    context: '最高級 / first / only 後面',
    desc: '加強「在所有時間中最…」的語氣',
    examples: [
      { en: "The best pizza that I've ever had.", tc: '我這輩子吃過最好吃的披薩。' },
      { en: "The first time I've ever been here.", tc: '我這輩子第一次到這裡。' },
    ],
  },
  {
    context: '否定句（從未）',
    desc: 'not + ever = never，語意相同',
    examples: [
      { en: "I haven't ever done that. = I've never done that.", tc: '我從來沒做過那件事。' },
    ],
  },
]

// G14
const forDurationExamples = [
  { en: "I've been dreaming of this moment for so long.", tc: '我夢想著這個時刻好久了。' },
  { en: "We hung out for a little while.", tc: '我們一起消磨了一小段時間。' },
  { en: 'She lived in Paris for two years.', tc: '她在巴黎住了兩年。' },
  { en: 'Wait here for a few minutes.', tc: '在這裡等幾分鐘。' },
]

// G15
const whileExamples = [
  {
    full: 'While I was boarding the plane, I put on my headphones.',
    short: 'While boarding the plane, I put on my headphones.',
    tc: '在登機的同時，我戴上了耳機。',
  },
  {
    full: 'While she was eating, she was reading a book.',
    short: 'While eating, she was reading a book.',
    tc: '她一邊吃東西，一邊看書。',
  },
]

// G16
const justAsExamples = [
  {
    en: 'The takeoff was just as beautiful as the landing.',
    tc: '起飛和降落一樣美。',
    note: 'just 在此加強語氣，強調「同樣地…」',
  },
  {
    en: 'This city is just as crowded as New York.',
    tc: '這座城市和紐約一樣擁擠。',
    note: '',
  },
  {
    en: 'She runs just as fast as her brother.',
    tc: '她跑得和她哥哥一樣快。',
    note: 'just as 也可以修飾副詞',
  },
]

// G17
const preferPatterns = [
  {
    formula: 'prefer to + V（比較喜歡做某事）',
    desc: '表示偏好做某件事',
    examples: [
      { en: 'I prefer to sit by the window.', tc: '我比較喜歡坐靠窗的位置。' },
      { en: 'She prefers to travel alone.', tc: '她比較喜歡一個人旅行。' },
    ],
  },
  {
    formula: 'prefer A to B（比起 B 更喜歡 A）',
    desc: '直接比較兩件事物',
    examples: [
      { en: 'I prefer tea to coffee.', tc: '比起咖啡，我更喜歡茶。' },
      { en: 'She prefers walking to driving.', tc: '她比起開車更喜歡走路。' },
    ],
  },
  {
    formula: 'prefer + V-ing（比較喜歡…）',
    desc: '和 prefer to + V 意思相同，後面改用動名詞',
    examples: [
      { en: 'I prefer sitting by the window.', tc: '我比較喜歡坐靠窗的位置。' },
    ],
  },
]

// G18
const getUsages = [
  {
    pattern: 'get + 名詞',
    meaning: '取得、得到、買',
    examples: [
      { en: 'I got a new phone.', tc: '我買了一支新手機。' },
      { en: 'Can I get some water?', tc: '我可以要些水嗎？' },
    ],
  },
  {
    pattern: 'get + 形容詞',
    meaning: '變得…（描述狀態改變）',
    examples: [
      { en: "It's getting cold.", tc: '天氣越來越冷。' },
      { en: 'I got lost.', tc: '我迷路了。' },
    ],
  },
  {
    pattern: 'get + 過去分詞 (V-pp)',
    meaning: '被…（被動，常指意外發生）',
    examples: [
      { en: 'I got scammed.', tc: '我被騙了。' },
      { en: 'She got hurt.', tc: '她受傷了。' },
    ],
  },
  {
    pattern: 'get + to + 地點',
    meaning: '到達某個地方',
    examples: [
      { en: 'We got to the airport at noon.', tc: '我們中午到了機場。' },
      { en: 'How do I get to Times Square?', tc: '我怎麼去時代廣場？' },
    ],
  },
  {
    pattern: 'get + to + V（不定詞）',
    meaning: '有機會做…、能夠做…',
    examples: [
      { en: 'We got to see beautiful landscapes.', tc: '我們有機會看到美麗的景色。' },
      { en: "I can't believe I got to meet her.", tc: '我不敢相信我竟然有機會見到她。' },
    ],
  },
  {
    pattern: 'get + 人 + to + V',
    meaning: '讓/說服某人做某事（使役）',
    examples: [
      { en: 'They got you to pay attention.', tc: '他們讓你去注意表演。' },
    ],
  },
]
</script>
