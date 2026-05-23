# MissHoney 影片頁全文校稿與精準學習跳轉提案

## Why

目前 `/a1`、`/a2`、`/b1`、`/b2` 的 MissHoney 播放清單影片頁已有基本內容，但品質不足，且互動體驗還沒有達到現有 `/ch1` 的學習頁水準。

希望把 MissHoney 各難度的每支影片，重新整理成正式學習內容頁：

- 字幕來源重新提取。
- 透過 `english_proofreader` 副代理校稿、翻譯、標註超綱單字、片語、特殊用法與文法。
- 將結果解析回影片頁資料。
- 讓全文中的標記可以精準跳到對應講解項目。
- 讓 grammar 路由吸收新文法補充，但避免重複建立同樣文法。
- 補齊與 `/ch1` 類似的回頂、跳轉、回原文位置等互動能力。

## Scope

本次處理 MissHoney 播放清單與其影片詳細頁：

- `/a1`
- `/a2`
- `/b1`
- `/b2`
- `/a1/:videoSlug`
- `/a2/:videoSlug`
- `/b1/:videoSlug`
- `/b2/:videoSlug`

既有 `/ch1` 可作為功能與 UI 參考，但不應破壞現有 `/ch1` 到 `/ch4` 的行為。

## Route Interaction Requirements

目前 `/ch1` 路由具備回頂按鈕、回到單字區按鈕、smooth scroll、以及回到原始 scroll 位置的能力。

MissHoney 的各影片詳細頁也要具備相同等級的互動體驗。

### Required Controls

每支 MissHoney 影片詳細頁應支援：

- 回到頁面頂部。
- 跳到單字區。
- 跳到片語區。
- 跳到特殊用法區。
- 跳到句型或文法解析區。
- 從講解項目回到剛剛點擊的全文位置。
- 所有跳轉使用 smooth scroll。
- 目標項目應盡量置於 viewport 中間，而不是貼在畫面頂部。
- 點擊全文 marker 後，目標講解卡片應短暫高亮，讓使用者看得出跳到哪一筆。
- 第一版不做 hover tooltip；先專注在點擊後的精準跳轉、置中與回原文。

建議實作行為：

```ts
element.scrollIntoView({
  behavior: 'smooth',
  block: 'center',
})
```

## Precise Inline Marker Navigation

全文中的標記不是只跳到「單字區」或「片語區」整個區塊，而是要跳到該標記對應的單一講解項目。

### Marker Types

`english_proofreader` 會在校稿後全文中使用下列標記：

| 類別 | 標記 | 範例 |
|------|------|------|
| A 超綱單字 | `**粗體**` | `**ubiquitous**` |
| B 超綱片語 | `__底線__` | `__take on__` |
| C 特殊用法 | `《書名號》` | `《run》 a business` |

解析後應建立對應關係：

- 點 `**apple**`，smooth scroll 到「apple」這一筆單字講解，且 apple 講解卡片盡量置中。
- 點 `__take on__`，smooth scroll 到「take on」這一筆片語講解，且該片語講解卡片盡量置中。
- 點 `《run》 a business`，smooth scroll 到「run 作為經營」這一筆特殊用法講解，且該特殊用法講解卡片盡量置中。

只有英文全文中的 marker 需要可點擊；繁體中文翻譯只顯示譯文，不需要做 marker 跳轉。

全文 inline marker 只負責跳到單字、片語、特殊用法。文法 / 句型解析不從全文 inline marker 觸發；使用者若要前往文法 / 句型解析，透過 quick nav 或區塊按鈕跳轉即可。

### Bidirectional Navigation

需要支援雙向精準定位：

1. 使用者在全文點擊 `apple`。
2. 頁面 smooth scroll 到「apple」單字講解項目。
3. 「apple」講解項目提供回到原文的操作。
4. 使用者點回到原文後，smooth scroll 回剛剛點擊的 `apple` 原文位置。
5. 原文中的 `apple` 也應盡量置於 viewport 中間。

這不是單純的「全文到單字區」，而是：

```text
全文標記 instance
→ 對應講解 item
→ 回到原本全文標記 instance
```

### Suggested Anchor Id Shape

建議每個可跳轉項目都有穩定 id：

- `word-apple`
- `phrase-take-on`
- `usage-run-business`
- `grammar-this-is-noun`

其中 `grammar-*` id 只供 quick nav 或文法區塊按鈕使用，不由全文 inline marker 觸發。

若同一個單字或片語在全文出現多次：

- 講解內容只建立一筆。
- 全文中多個 marker instance 都連到同一筆講解。
- 回到原文時，要回到使用者剛剛點擊的那一個 marker instance，而不是固定回第一個出現位置。

若同一個單字有不同變化形，建議以 lemma 合併講解，例如 `apple` / `apples` 合併到 `apple`，`run` / `running` 合併到 `run`；但全文 marker 仍保留原文實際出現的字形。

## Content Refresh Workflow

整體處理順序固定為：

```text
A1 全部影片
→ A2 全部影片
→ B1 全部影片
→ B2 全部影片
```

每個播放清單可以視為一個大 task；每支影片可以視為一個中 task；每支影片內再拆成多個小 task，方便後續暫停、恢復與指定先不執行。

正式 tasks 可以先完整規劃 A1、A2、B1、B2，但第一輪 apply 只執行基礎功能與 A1 ch1 vertical slice。A1 ch1 完整打通後，再依相同流程往後擴展。

## Per Video Workflow

以 A1 第一支影片為例：

```text
/a1/ch1-slow-english-for-beginners-a1-listening-practice
YouTube: https://www.youtube.com/watch?v=kVNYOW3eMk4
```

每支影片依序執行：

1. 讀取該 MissHoney 影片路由資料，取得 YouTube URL。
2. 使用新增的單支影片字幕提取 script 提取該 YouTube 影片的英文字幕。
3. 將字幕全文覆寫到：

```text
_private/tmp.txt
```

4. 呼叫 `english_proofreader` 副代理，使用檔案 I/O 模式：

```text
請用 english_proofreader 副代理，使用檔案 I/O 模式處理：
讀取 @/_private/tmp.txt，
輸出並覆寫到 @/_private/proofread_result.md；
完成後回傳結果，並結束該副代理。
```

5. 讀取並解析：

```text
_private/proofread_result.md
```

6. 將解析結果寫回該影片的 `PlaylistVideoData` JSON。
7. 更新影片頁全文、單字、片語、特殊用法、句型或文法解析。
8. 更新或補充 grammar 路由。
9. 驗證該影片頁可以正常顯示與精準跳轉。

完成 A1 ch1 後，繼續 A1 ch2、A1 ch3，直到 A1 播放清單全部影片完成，再進入 A2。A2 完成後執行 B1，B1 完成後執行 B2。

## Proofread Result Parsing

`_private/proofread_result.md` 會包含：

- 校稿後文本。
- 完整繁體中文翻譯。
- A 超綱單字表。
- B 超綱片語表。
- C 特殊用法表。
- D 超綱文法表。
- machine-readable JSON code block。

主代理需要解析這些內容，並轉成 app 可使用的結構化資料。

`english_proofreader.toml` 必須強制要求副代理輸出 JSON 區塊，避免只靠 Markdown 表格解析。Markdown 區塊給人檢查，JSON 區塊給主代理寫回 `PlaylistVideoData`。

建議 JSON 最少包含：

```json
{
  "correctedText": "",
  "translation": "",
  "segments": [],
  "words": [],
  "phrases": [],
  "usages": [],
  "grammar": []
}
```

### Target Content Sections

每支影片頁至少需要產生：

- 全文中英對照。
- 重點單字。
- 重點片語。
- 特殊用法。
- 句型解析。
- 文法補充。
- YouTube 來源連結。
- 難度資訊。

`C 特殊用法` 要在影片頁中獨立成一個區塊，不併入單字或片語。quick nav 也應有對應入口，全文 marker 點擊後可精準跳到該特殊用法項目。

### Inline Marker Handling

校稿後文本中的 markdown-like 標記要轉成結構化 inline tokens，而不是直接塞 HTML 字串。

例如：

```text
I eat an **apple** every day.
```

應轉為可被 Vue render 的資料：

```json
[
  { "text": "I eat an ", "type": "text" },
  { "text": "apple", "type": "word", "targetId": "word-apple" },
  { "text": " every day.", "type": "text" }
]
```

如此才能做到：

- 點 marker 精準跳轉。
- 維持 JSON 純資料。
- 避免在 JSON 內放 HTML。
- 保持 accessibility 與 Vue render control。

## Grammar Route Integration

`proofread_result.md` 的 D 超綱文法不只要出現在影片頁，也要整合到 grammar 路由。

規則：

- 第一輪採保守補充，不積極重構 grammar route。
- 已經介紹過且能明確對上的文法，不新增重複文法項目。
- 若是既有文法的明確延伸，應補充到既有文法中。
- 若只是同一個句型再次出現，應補充例句或使用情境，不另開新項目。
- 若既有文法只介紹一部分，且這次出現的另一部分可明確歸類，才合併補充。
- 若文法分類不確定，或現有 grammar schema 不適合承載，先只放在該影片頁的「句型 / 文法解析」區，不為 A1 ch1 大改 grammar schema。

例如：

- 既有「關係子句」已介紹 `that`。
- 新影片出現 `which`。
- 不要新增另一個「關係子句」項目。
- 應把 `which` 補充進既有「關係子句」介紹。

## Instructional Deduplication Rules

原文與翻譯要盡量保留完整內容，但教學講解不能重複灌水。

此處的去重只適用於教學講解資料，不是刪除字幕原文，也不是刪除中文翻譯。來源字幕、校稿後全文與翻譯仍要完整保留。

規則：

- 校稿後全文中的重複句子仍要保留。
- 中文翻譯中的對應內容仍要保留。
- 單字、片語、特殊用法、文法講解要去重。
- 同一個用法只講解一次。
- 後續相同用法不新增重複講解。
- 不使用「同上」當作講解。
- 若需要保留多個例句，可在第一次講解中合併列出。

例子：

```text
This is an apple.
This is a pen.
```

兩句都使用：

```text
This is + 名詞
```

因此文法或句型區只講解一次 `This is + 名詞`，不要為 apple 和 pen 各寫一次相同講解。

## Task Breakdown Model

任務量很大，因此 task 要切得很細，方便控管。

### Big Task

一個播放清單是一個大 task：

- A1 playlist refresh
- A2 playlist refresh
- B1 playlist refresh
- B2 playlist refresh

### Medium Task

一支影片是一個中 task：

- A1 ch1
- A1 ch2
- A1 ch3
- A2 ch1
- B1 ch1
- B2 ch1

### Small Tasks

每支影片再拆成：

1. 取得影片 URL。
2. 提取 YouTube 英文字幕。
3. 覆寫 `_private/tmp.txt`。
4. 呼叫 `english_proofreader` 副代理。
5. 讀取 `_private/proofread_result.md`。
6. 解析校稿後全文與中文翻譯。
7. 解析 A 超綱單字。
8. 解析 B 超綱片語。
9. 解析 C 特殊用法。
10. 解析 D 超綱文法。
11. 產生 inline marker tokens。
12. 產生精準 anchor id。
13. 更新該影片 JSON。
14. 更新 grammar route 補充內容。
15. 驗證影片頁 render。
16. 驗證 marker 點擊可置中跳到對應講解項目。
17. 驗證目標講解卡片會短暫高亮。
18. 驗證講解項目可回到原本全文 marker instance。
19. 驗證重複講解已去重。
20. 跑內容 validator。
21. 跑 route smoke test。

## Initial Apply Scope

第一輪 apply 不直接重做全部 A1/A2/B1/B2。第一輪只做：

1. `english_proofreader` JSON 輸出契約。
2. proofread result parser。
3. `PlaylistVideoData` 必要 schema 擴充。
4. 影片頁精準 marker navigation。
5. 特殊用法獨立區塊。
6. 目標卡片置中與短暫高亮。
7. 回到原本全文 marker instance。
8. A1 ch1 vertical slice：
   - 提取字幕。
   - 寫入 `_private/tmp.txt`。
   - 真的呼叫一次 `english_proofreader` 副代理，而不是使用人工 fixture 假資料。
   - 解析 `_private/proofread_result.md`。
   - 主代理可在寫回 app JSON 前修正副代理 JSON 的小錯，例如欄位缺漏、lemma 不一致、例句對齊問題，但不可改變原字幕主要內容。
   - 寫回 A1 ch1 JSON。
   - 以保守補充方式更新 grammar route；明確能對上的既有文法才補充，分類不確定者只留在影片頁文法區。
   - 完成測試。

此 vertical slice 通過後，再繼續 A1 剩餘影片，最後依序推進 A2、B1、B2。

## Resolved Decisions

1. `proofread_result.md` 必須包含 machine-readable JSON code block；因此 `english_proofreader.toml` 需要新增強制輸出 JSON 規則。
2. 第一輪只做 A1 ch1 vertical slice，不一次 apply 全部播放清單。
3. `C 特殊用法` 獨立成影片頁區塊，不併入單字或片語。
4. 只有英文全文 marker 可點擊；中文翻譯不需要可點擊。
5. 同一單字不同變化形依 lemma 合併講解，但全文保留原字形。
6. 點擊 marker 後，目標講解卡片需要短暫高亮。
7. 第一版不做 hover tooltip。
8. tasks 可以完整規劃到 A1/A2/B1/B2，但實作時先執行基礎功能與 A1 ch1 vertical slice。
9. A1 ch1 vertical slice 要真的跑一次 `english_proofreader`，不使用人工 fixture 假資料替代。
10. 主代理可以在寫回 app JSON 前做 normalization / correction，但不可改變原字幕主要內容。
11. grammar route 第一輪採保守補充，不為 A1 ch1 積極重構 grammar schema。
12. 新增單支影片字幕提取 script，讓 A1 ch1 vertical slice 可用單一指令把該影片英文字幕覆寫到 `_private/tmp.txt`，而不是依賴不易控管的批次流程。
13. 全文 inline marker 只跳轉到單字、片語、特殊用法；文法 / 句型解析只透過 quick nav 或區塊按鈕跳轉。

## Suggested Next Step

建議先建立正式 Spectra change，例如：

```text
refresh-misshoney-proofread-content-and-navigation
```

第一輪先做 A1 ch1 作為 vertical slice，完整打通：

```text
字幕提取
→ english_proofreader
→ proofread_result 解析
→ JSON 寫入
→ 精準 marker anchor
→ grammar 補充
→ 測試
```

A1 ch1 打通後，再複製相同流程到 A1 剩餘影片，最後依序推進 A2、B1、B2。完整任務可以先寫好，但 apply 時先以 A1 ch1 為實作邊界。
