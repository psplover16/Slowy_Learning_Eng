## 1. Coverage-first tests

- [x] 1.1 依 `Verify topic coverage with content-oriented tests` 為 `Ch2 has a full-text bilingual article with 10 scenes` 建立內容覆蓋測試：彙整 `src/modules/chapters/data/ch2.ts` 的 scenes English text，驗證 listening-first learning、repeated exposure、repetition before perfection、shadowing practice、understanding before fluency、passive learning 都存在，且 raw subtitle fragments `fram repeating more`、`habits are built t proof repetition`、`The I push themselves`、`H sounds anymore` 不存在；完成定義是相關 unit test 在修正文前可偵測缺口，修正文後 `npm run test:unit` 通過。
- [x] 1.2 依 `Verify topic coverage with content-oriented tests` 為 `Ch3 has a full-text bilingual article with 10 scenes` 建立內容覆蓋測試：彙整 `src/modules/chapters/data/ch3.ts` 的 scenes English text，驗證 traditional study limitations、slow listening and shadowing、hesitation reduction、clear communication、daily consistency 都存在，且 raw subtitle fragments `new M. Oments`、`PF ect sentence`、`This builds C confidence`、`S Oh. When you speak`、`each time me you continue speaking`、`Slow podcast. TS simple conversations` 不存在；完成定義是相關 unit test 在修正文前可偵測缺口，修正文後 `npm run test:unit` 通過。

## 2. Chapter content correction

- [x] 2.1 依 `Preserve chapter data architecture and update only chapter content` 與 `Use existing ch1 route as implementation reference` 修正 ch2 data：參照 ch1 的 chapters registry/dataLoader/ChapterData/ChapterView smoke 模式，讓 `src/modules/chapters/data/ch2.ts` 仍輸出符合 ChapterData 的 10 個 bilingual scenes，但主文完整補齊 `_private/propose.md` 的 ch2 Content Scope，並保留既有 vocab/phrase links；完成定義是 `npm run test:unit`、`npm run build` 與 `/ch2` e2e smoke 通過，且 ch1 測試期望未被修改。
- [x] 2.2 依 `Preserve chapter data architecture and update only chapter content` 與 `Use existing ch1 route as implementation reference` 修正 ch3 data：參照 ch1 的 chapters registry/dataLoader/ChapterData/ChapterView smoke 模式，讓 `src/modules/chapters/data/ch3.ts` 仍輸出符合 ChapterData 的 10 個 bilingual scenes，但主文完整補齊 `_private/propose.md` 的 ch3 Content Scope；完成定義是 `npm run test:unit`、`npm run build` 與 `/ch3` e2e smoke 通過，且 ch1 route 與 ch1 content 不被改動。

## 3. Completeness review

- [x] 3.1 依 `Completeness comes before prose polishing` 執行人工內容回對：逐段檢查 ch2/ch3 最終 scenes 是否涵蓋 `_private/propose.md` 的 Content Scope、Correction Rules、Acceptance Criteria，確認沒有因摘要化或合併重複段落而遺失唯一語意；完成定義是 implementation summary 記錄回對結果與任何合併重複段落的理由。
- [x] 3.2 保持 UI 與章節資料架構不漂移：確認 ChapterData interface、ChapterView layout、quick-nav behavior、路由生成、MP3 player，以及作為參照的 ch1 route/data/test expectations 沒有因內容修復被改動；完成定義是 `git diff` 檢查只出現 ch2/ch3 內容資料與測試必要變更，且 `/ch1`、`/ch2`、`/ch3` e2e smoke 仍通過。

## 4. Final validation

- [x] 4.1 執行最終驗證並整理完成摘要：`npm run test:unit`、`npm run build`、相關 `/ch2` 與 `/ch3` e2e smoke、`spectra analyze correct-ch2-ch3-subtitle-content --json`、`spectra validate correct-ch2-ch3-subtitle-content` 全部通過；完成摘要列出 modified files、ch2/ch3 topic coverage、subtitle correction examples 與 local verification results。
- [ ] 4.2 補回使用者指出的 ch2 開場逐字稿句子 `How many words should I memorize?`：先在 Ch2 content coverage unit test 加入這句作為 required signal，確認修正前可偵測缺漏，再補入 `src/modules/chapters/data/ch2.ts` 的 scene-01 bilingual sentences；完成定義是 `npm run test:unit -- src/__tests__/ChapterView.test.ts -t "ch2"`、`spectra analyze correct-ch2-ch3-subtitle-content --json`、`spectra validate correct-ch2-ch3-subtitle-content` 通過，且 ch1/ch3 內容不被修改。
