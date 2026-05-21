// ────────────────────────────────────────────────────────────────────────────
// Ch2 Content Draft — 語言學習主題
// 影片來源：https://www.youtube.com/watch?v=4NsjDxtf80k
//
// 使用方式：確認內容後複製到 src/modules/chapters/data/ch2.ts
// 並在 src/shared/config/chapters.ts 加上 ch2 的路由條目。
//
// ⚠️ 待填項目：
//   - headerTitleZh / headerTitleEn（需確認影片標題）
//   - headerLevelTag / headerTopicTag（請依影片難度調整）
//   - feel silent（原列表條目無翻譯，已略過，請補充）
// ────────────────────────────────────────────────────────────────────────────

import type { ChapterData } from '../src/modules/chapters/types'

const chapter: ChapterData = {
  headerTitleZh: '語言究竟是怎麼學會的',
  headerTitleEn: 'How Languages Are Really Learned',
  headerPodcastLabel: 'Slow English Podcast',
  headerLevelTag: '',
  headerTopicTag: '',
  mp3Src: null,

  // 本章無全文。scenes: [] 讓 ChapterView 自動隱藏「全文」按鈕與區塊。
  scenes: [],

  vocabGroups: [
    {
      title: '主題一・學習心態',
      items: [
        {
          english: 'frustrated',
          kk: '/ˈfrʌstreɪtɪd/',
          pos: 'adj.',
          meaning: '感到挫折的、沮喪的',
          example: "Don't feel frustrated.",
        },
        {
          english: 'fear',
          pos: 'n./v.',
          meaning: '恐懼、害怕',
          example: 'Many learners fear making mistakes.',
        },
        {
          english: 'comfort',
          kk: '/ˈkʌmfərt/',
          pos: 'n.',
          meaning: '舒適感、安心感',
          example: 'You build comfort with the language.',
        },
        {
          english: 'confident',
          kk: '/ˈkɒnfɪdənt/',
          pos: 'adj.',
          meaning: '有自信的',
          example: 'You will feel more confident.',
        },
        {
          english: 'passive',
          kk: '/ˈpæsɪv/',
          pos: 'adj.',
          meaning: '被動的（例如被動吸收）',
          example: 'Passive listening builds fluency.',
        },
        {
          english: 'stuck',
          kk: '/stʌk/',
          pos: 'adj.',
          meaning: '卡住的、停滯不前的',
          example: 'Do you feel stuck?',
          // ⚠️ 校對注意：用戶原標為「動詞」，但在「feel stuck / get stuck」
          // 中 stuck 為形容詞（過去分詞作表語形容詞），故改為 adj.
        },
      ],
    },
    {
      title: '主題二・學習方法',
      items: [
        {
          english: 'exposure',
          kk: '/ɪkˈspoʊʒər/',
          pos: 'n.',
          meaning: '接觸；（語言學習）大量沉浸',
          example: 'Exposure to English builds fluency.',
        },
        {
          english: 'shadowing',
          kk: '/ˈʃædoʊɪŋ/',
          pos: 'n.',
          meaning: '影子跟讀（法）——邊聽邊模仿',
          example: 'Try shadowing when you listen.',
        },
        {
          english: 'repetition',
          kk: '/ˌrɛpɪˈtɪʃən/',
          pos: 'n.',
          meaning: '重複、反覆練習',
          example: 'Repetition corrects your patterns.',
        },
        {
          english: 'pattern',
          kk: '/ˈpætərn/',
          pos: 'n.',
          meaning: '模式、句型規律',
          example: 'Your brain picks up the pattern.',
        },
        {
          english: 'fluency',
          kk: '/ˈfluːənsi/',
          pos: 'n.',
          meaning: '流暢度、流利度',
          example: 'Fluency is built through listening.',
        },
      ],
    },
    {
      title: '主題三・語言與表達',
      items: [
        {
          english: 'grammar',
          kk: '/ˈɡræmər/',
          pos: 'n.',
          meaning: '文法',
          example: "You don't need to study grammar directly.",
          // ⚠️ 校對注意：用戶原拼為「grammer」，正確拼法為 grammar。
        },
        {
          english: 'rhythm',
          kk: '/ˈrɪðəm/',
          pos: 'n.',
          meaning: '節奏',
          example: 'You start to feel the rhythm of English.',
        },
        {
          english: 'pronunciation',
          kk: '/prəˌnʌnsiˈeɪʃən/',
          pos: 'n.',
          meaning: '發音',
          example: 'Your pronunciation improves naturally.',
        },
        {
          english: 'foundation',
          kk: '/faʊnˈdeɪʃən/',
          pos: 'n.',
          meaning: '基礎',
          example: 'Listening is the foundation of language.',
        },
        {
          english: 'phrases',
          kk: '/ˈfreɪzɪz/',
          pos: 'n.',
          meaning: '片語、慣用語',
          example: 'You start using common phrases.',
        },
      ],
    },
    {
      title: '主題四・其他詞彙',
      items: [
        {
          english: 'podcast',
          kk: '/ˈpɑːdkæst/',
          pos: 'n.',
          meaning: '播客、廣播節目',
          example: 'Listen to a podcast every day.',
        },
        {
          english: 'proof',
          kk: '/pruːf/',
          pos: 'n.',
          meaning: '證明、證據',
          example: 'The proof is in your progress.',
        },
        {
          english: 'correct',
          pos: 'v./adj.',
          meaning: '修正、校正（動詞）／ 正確的（形容詞）',
          example: 'Listening corrects your patterns.',
          // ⚠️ 校對注意：用戶原列為「corrects」，但那只是第三人稱單數變化，
          // 不是獨立詞形。詞目應列為 correct。
        },
        {
          english: 'even',
          kk: '/ˈiːvən/',
          pos: 'adv./adj.',
          meaning: '甚至、連（副詞，用於強調）／ 平整的、偶數的（形容詞）',
          example: 'Even beginners can improve quickly.',
          // ⚠️ 校對注意：用戶原列為「形容詞/副詞/名詞」，但 even 作名詞的用法
          // 在現代英語中不存在，已移除。「相等」是 adj. 的一個義項，已整合進去。
        },
      ],
    },
  ],

  phrases: [
    {
      id: 'vocab-fills-the-gaps',
      phrase: 'fills the gaps (with time)',
      meaning: '（時間）慢慢補齊那些空缺與不足',
      note:
        '"fill the gap" = 補齊空缺。在語言學習裡，這句話的意思是：大腦會隨時間自動補齊你還不懂的地方，不需要刻意死背。',
      example: 'Your brain keeps filling the gaps with time.',
      exampleTc: '你的大腦會隨著時間慢慢補齊那些空缺。',
    },
    {
      id: 'vocab-consistency-matters',
      phrase: 'consistency matters more than time',
      meaning: '持之以恆比一次花多少時間更重要',
      note:
        '"matter"（動詞）= 有影響、重要、造成差別。"consistency"（持之以恆）才是關鍵，不是一次練幾小時。',
      example: 'Consistency matters more than time.',
      exampleTc: '持之以恆比一次練多久更重要。',
    },
    {
      id: 'vocab-builds-quietly',
      phrase: 'builds ~ quietly',
      meaning: '在不知不覺中慢慢建立～',
      note:
        '"quietly" 在這裡是副詞，形容「悄悄地、不知不覺地」，搭配 build 表示一種緩慢積累的過程，沒有明顯的時間點，某天你回頭才發現進步了。',
      example: 'It builds confidence quietly.',
      exampleTc: '它會在不知不覺中建立自信。',
    },
    {
      id: 'vocab-rush',
      phrase: "don't rush / you're rushing it",
      meaning: '別急、別逼自己 ／ 你太急了',
      note:
        '"rush" 在語言學習情境常帶有「對自己施壓、急著想快點流利」的意思，不只是「移動很快」。\n\n常見例句：\n・Don\'t rush. → 別急、別硬趕進度\n・You\'re rushing it. → 你太想快點達到流暢了',
      example: "Don't rush. Let fluency come naturally.",
      exampleTc: '別急，讓流暢度自然而然地到來。',
    },
    {
      id: 'vocab-go-silent',
      phrase: 'go silent / fall silent',
      meaning: '突然沉默下來、變得安靜',
      note:
        '"go silent" 和 "fall silent" 意思相近，都表示「（突然）變得安靜、沉默」。\n\n・go silent — 強調狀態的轉變，偏口語\n・fall silent — 帶有「靜了下來」的畫面感，稍微文學一點\n\n類似結構：go quiet, go blank, fall asleep（狀態動詞 + 形容詞）',
      example: 'The room fell silent.',
      exampleTc: '房間裡突然靜了下來。',
    },
  ],

  breakdowns: [
    {
      id: 'vocab-learning-best',
      sentence: 'learning happens best when the mind is calm',
      translation: '學習在心情平靜時效果最好',
      chunks: [
        {
          en: 'learning happens best when ~',
          note: '"happen best when ~" = 在某條件下效果最好。可套用到其他情況：Sleep happens best when you\'re relaxed.',
        },
        {
          en: 'the mind is calm',
          note:
            '"mind" = 心智、內心狀態。"calm" = 平靜的。核心概念：放鬆學習比緊張學習更有效。',
        },
      ],
    },
    {
      id: 'vocab-song-familiar',
      sentence: 'soon the song feels familiar',
      translation: '很快你會覺得那首歌變得熟悉',
      chunks: [
        {
          en: 'feel + adj.',
          note:
            '感覺到某種狀態，e.g. feel familiar（感覺熟悉）, feel confident（感覺有自信）',
        },
        {
          en: 'familiar',
          note:
            '熟悉的。"feel familiar" = 開始有熟悉的感覺。和 "know" 不同——是感受，不是認知。',
        },
      ],
    },
    {
      id: 'vocab-built-through',
      sentence: 'fluency is built through listening',
      translation: '流暢度是透過聆聽慢慢建立起來的',
      chunks: [
        {
          en: 'be built through ~',
          note:
            '"built" 是 build 的過去分詞，這裡是被動語態（be + pp）。be built through ~ = 透過…被建立。英文很常用 build 比喻抽象能力的建立（中文可翻：建立、培養、累積）。',
        },
        {
          en: 'through + V-ing',
          note:
            '"through" 後接動名詞，表示「透過～的過程」。e.g. through practice, through listening.',
        },
        {
          // build 時態補充
          en: 'build → built → built',
          note:
            'build（現在式）→ built（過去式）→ built（過去分詞）。被動句 "is built" 使用過去分詞。',
        },
      ],
    },
    {
      id: 'vocab-sentences-feel-heavy',
      sentence: 'your sentences feel heavy',
      translation: '你說的句子聽起來很「沉重」（生硬、不自然）',
      chunks: [
        {
          en: 'feel heavy',
          note:
            '字面是「感覺沉重」，在語言學習裡比喻句子「生硬、不自然、像是直翻的中文」。相反：feel light / feel natural（聽起來自然流暢）。',
        },
        {
          en: '⚠️ 常見錯誤',
          note:
            '正確：your sentences feel heavy。\n錯誤：your sentences have feel heavy（"have feel" 是中式英文，應避免）。',
        },
      ],
    },
    {
      id: 'vocab-with',
      sentence: 'with — 三個核心用法',
      translation: '介系詞 with 的三種意思',
      chunks: [
        {
          en: 'with = 跟……一起',
          note: 'I learn with a friend. / She studies with music on.',
        },
        {
          en: 'with = 用……（作為手段或工具）',
          note: 'She writes with a pen. / I practice with podcasts.',
        },
        {
          en: 'with = 帶著……（伴隨狀態）',
          note: 'He speaks with confidence. / She answered with a smile.',
        },
      ],
    },
  ],
}

export default chapter
