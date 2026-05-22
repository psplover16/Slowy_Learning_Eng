## MODIFIED Requirements

### Requirement: Ch3 has a full-text bilingual article with 10 scenes

Ch3 SHALL have a `scenes` array containing exactly 10 bilingual scene objects. Each scene SHALL have an `id` (scene-01 through scene-10), a bilingual title (`titleZh`, `titleEn`), an array of `sentences` each with `en` and `tc` fields, and a `tags` array. The 10 scenes SHALL cover four thematic sections from the podcast transcript: traditional study limitations (scenes 01-03), slow listening and shadowing technique (scenes 04-06), overcoming hesitation (scenes 07-08), and consistency practice (scenes 09-10). The article SHALL preserve the main transcript content instead of a shortened summary. It SHALL include the content groups listed for Ch3 in `_private/propose.md`: traditional study teaches knowledge but not fluency, translation makes speaking slow, fluency grows from repetition and experience, slow podcasts reduce pressure, speaking practice differs from studying about speaking, slow listening plus shadowing, pronunciation through rhythm, shadowing as support and reaction training, hesitation from searching for perfect sentences, clear communication before perfect English, simple chunks, slow clear speaking, solo speaking practice, mistakes as growth signals, daily consistency, repetition of the same content, patience, identity, and calm environments.

#### Scenario: Full-text section is rendered

- **WHEN** the user visits `/ch3`
- **THEN** the `#ch3-section-bilingual` section is visible
- **THEN** the section heading contains "中英對照全文"
- **THEN** 10 scene blocks with `data-testid` matching `scene-01` through `scene-10` are present

#### Scenario: Ch3 transcript coverage is complete enough for learning

- **WHEN** the Ch3 `scenes` text is inspected
- **THEN** the English text SHALL include coverage of traditional study limitations, slow listening and shadowing, hesitation reduction, clear communication, and daily consistency
- **THEN** the English text SHALL NOT collapse those content groups into a short summary

##### Example: required Ch3 topic coverage

| Topic group | Required coverage signal |
| --- | --- |
| traditional study limitations | knowing grammar and vocabulary is different from speaking fluently |
| slow listening and shadowing | slow listening helps understanding and shadowing trains mouth movement and rhythm |
| hesitation reduction | hesitation comes from searching for perfect sentences and fear of mistakes |
| clear communication | calm, clear speech matters more than fast or perfect speech |
| daily consistency | short daily practice is stronger than occasional long study sessions |

#### Scenario: Ch3 subtitle artifacts are conservatively corrected

- **WHEN** the Ch3 English text is inspected
- **THEN** obvious subtitle artifacts SHALL be corrected without adding unrelated new arguments
- **THEN** the text SHALL NOT contain raw broken fragments from the source proposal such as `new M. Oments`, `PF ect sentence`, `This builds C confidence`, `S Oh. When you speak`, `each time me you continue speaking`, or `Slow podcast. TS simple conversations`

#### Scenario: Ch3 transcript signals are not omitted

- **WHEN** the Ch3 `scenes` text is inspected
- **THEN** the English text SHALL preserve representative transcript signals from `_private/discuss.txt` beyond topic summaries
- **THEN** those signals SHALL include separated skills in traditional study, conversation practice in context, slow podcasts slowing the process without slowing progress, shadowing patience and presence, hesitation safety practice, grammar improving through exposure, consistency waves, identity shift, calm learning environments, and the final language-as-life guidance
- **THEN** repeated transcript sections SHALL be preserved after typo and grammar correction instead of being collapsed into a single summary
