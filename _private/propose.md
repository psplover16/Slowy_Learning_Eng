# Proposal: 校正並補齊 ch2 / ch3 YouTube 字幕主文

## Why

`discuss.txt` 指出 ch1、ch2、ch3 的來源都是 YouTube 字幕，因此文字可能有辨識錯誤；同時也明確指出 ch2 與 ch3 的主文先前「漏了太多」。本次變更的核心不是重新創作文章，而是以逐字稿為唯一內容來源，完整校正並補齊 ch2 / ch3 主文，避免再發生大段遺漏。

## What Changes

- 以 `discuss.txt` 中的 ch2 與 ch3 英文逐字稿作為內容清單。
- 校正明顯 YouTube 字幕錯誤，例如斷字、錯字、重複字、錯誤大小寫、句點切錯、明顯 ASR 誤聽。
- 保留原文的主要語意、段落順序、教學節奏與重複練習感。
- 補齊 ch2 主文，不可只保留摘要或少量段落。
- 補齊 ch3 主文，不可只保留核心概念而漏掉後段 technique、hesitation、consistency 等內容。
- 對疑似重複字幕段落採保守策略：只有在內容明顯是同一段重複輸出時，才整理成單一校正版；不能因為「看起來重複」就刪掉新的語意。

## Non-Goals

- 不重新撰寫成全新的英文文章。
- 不把逐字稿改寫成短版摘要。
- 不新增 ch4 或其他章節。
- 不設計新的學習功能、測驗功能、SRS 或音訊播放器功能。
- 不依賴 `discuss.txt` 以外的外部資料校稿。

## Content Scope

### ch2 main text

ch2 的主題是「聽力是語言學習的起點，理解先於流利，重複讓口說自然發生」。內容至少包含以下段落群：

- 初學者常問 grammar / vocabulary，但真正的起點是 listening。
- 嬰兒學語言的比喻：先聽聲音、語調、節奏，再慢慢理解。
- 即使沒有完全理解，brain 仍透過 exposure 學習 English 的 sound、sentence movement、word boundaries。
- 不理解全部內容是正常且必要的，不應因此停止 listening。
- Slow, clear English 讓 mind calm，降低 pressure / fear。
- 語言像 music，一再聽會變 familiar。
- Listening builds understanding、confidence，並 prepares you to speak。
- Speaking comes from memory，而 memory is built through listening。
- 不要先硬擠 grammar books，而是 listen more, slowly, calmly。
- Speaking does not come from perfection; it comes from repetition。
- Children repeat sounds / words / sentences，不等待完美。
- Repetition trains brain patterns、mouth movement、voice rhythm。
- Shadowing practice：listen and repeat immediately, copy rhythm, not rules。
- Fluency grows from simple language repeated many times。
- Slow speaking is confident speaking。
- Understanding comes before fluency。
- Passive learning / exposure / repeated listening 讓 fear 變小，speaking follows。

### ch3 main text

ch3 的主題是「傳統學習不足以產生流利；慢速聽力、shadowing、降低 hesitation 與 consistency 才會建立口說習慣」。內容至少包含以下段落群：

- Traditional study teaches knowledge, but fluency requires skill。
- Knowing words / grammar 不等於能在 conversation 中使用。
- Translation in the mind makes speaking slow and tiring。
- Fluency is built through repetition and experience, not explanation。
- Slow podcasts remove pressure and let the brain relax。
- Speaking must be trained directly; reading about swimming cannot make you a swimmer。
- Repetition, not novelty, builds deep fluency。
- Slow listening + shadowing 是主要 technique。
- Slow listening gives the brain time to understand without panic。
- Shadowing trains mouth movement, rhythm, pronunciation, reaction, and muscle memory。
- Shadowing reduces fear because the speaker's voice guides the learner。
- Hesitation comes from searching for the perfect sentence。
- The goal is clear communication, not perfect English。
- Simple chunks such as “I think,” “I feel that,” “In my opinion,” and “One reason is” give the brain safe paths.
- Calm, clear, slow speaking is fluency; fast speech is not the goal。
- Practice speaking alone to remove social pressure。
- Mistakes are signals of growth, not failure。
- Consistency is the most important part: 10 minutes every day is stronger than 2 hours once a week。
- A simple daily routine can be slow listening, sentence repetition, and free speaking。
- Repeating the same content deeply builds understanding, memory, prediction, and natural speech。
- Patience and identity matter: move from “I am learning English” to “I speak English.”
- Fluency grows in calm environments: slow podcasts, simple conversations, gentle repetition。

## Correction Rules

- Correct obvious subtitle errors while preserving meaning.
- Join broken words and remove accidental spaces inside words.
- Normalize punctuation where sentence boundaries are clear.
- Preserve repeated rhetorical patterns when they support teaching rhythm.
- Do not remove a sentence unless it is confirmed to be duplicate subtitle noise.
- If a duplicated section contains different wording, keep the stronger complete version and make sure no unique idea is lost.

### Obvious correction examples from `discuss.txt`

| Raw subtitle fragment | Corrected direction |
| --- | --- |
| `fram repeating more` | `from repeating more` |
| `habits are built t proof repetition` | `habits are built through repetition` |
| `The I push themselves` | `They push themselves` |
| `H sounds anymore` | `English sounds anymore` |
| `build strength` | `builds strength` |
| `new M. Oments` | `new movements` |
| `PF ect sentence` | `perfect sentence` |
| `This builds C confidence` | `This builds confidence` |
| `S Oh. When you speak` | `So when you speak` |
| `each time me you continue speaking` | `each time you continue speaking` |
| `Slow podcast. TS simple conversations` | `Slow podcasts, simple conversations` |

## Acceptance Criteria

- ch2 主文涵蓋 `Content Scope / ch2 main text` 的全部段落群。
- ch3 主文涵蓋 `Content Scope / ch3 main text` 的全部段落群。
- 校正後的文章不得只剩摘要；必須保留逐字稿的大部分內容與教學節奏。
- 明顯字幕錯誤已修正，且不引入與來源無關的新論點。
- 若移除重複段落，必須確認被移除段落沒有唯一語意。
- 最終校正版可逐段回對 `discuss.txt`，確認沒有大段遺漏。

## Conclusion

**Decision**: 以 `discuss.txt` 為唯一輸入，將 ch2 / ch3 主文做「完整補齊 + 保守校正」，而不是摘要或改寫。

**Rationale**: 使用者明確指出 YouTube 字幕可能不準，但更大的問題是內容漏太多；因此最重要的取捨是「完整性優先於文學化改寫」。校正只能修掉明顯字幕錯誤，不能為了讀起來精簡而刪掉教學內容。

**Capture to**: `_private/propose.md`
