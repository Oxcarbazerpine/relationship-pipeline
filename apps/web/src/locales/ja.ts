import type { TranslationResources } from "./zh";

export const ja: TranslationResources = {
  title: "関係性パイプライン",
  subtitle: "システムで投入とリスクを管理",
  trial: "7 日間無料、その後サブスクリプション",
  signIn: "ソーシャルアカウントでログイン",

  stage: "段階",
  nextAction: "次のアクション",
  priority: "優先度",
  score: "スコア",
  advisorMode: "判断方式",
  advisorReason: "判断理由",
  lastInteraction: "最後の交流",
  actionDueAtLabel: "アクション DDL",
  notesLabel: "判断理由メモ",
  daysSinceInteraction: "最後の交流からの日数",
  daysUntilDue: "DDL までの残日数",
  daysOverdue: "{{days}} 日超過",
  daysRemaining: "残り {{days}} 日",

  add: "追加",
  save: "保存",
  cancel: "キャンセル",
  delete: "削除",
  confirmDelete: "このレコードを削除しますか?",
  newConnection: "新規追加",
  name: "ラベル",
  preview: "エンジンプレビュー",
  empty: "記録がありません。最初の相手を追加してください。",

  engineSuggests: "エンジン提案",
  youOverrode: "手動で上書き中",
  acceptSuggestion: "提案を受け入れる",
  override: "手動調整",
  overrideReason: "メモ",
  recommended: "推奨",
  clearOverride: "上書きを解除 (推奨に戻す)",
  aiUnavailable: "AI エンドポイント利用不可",
  noSignals: "なし",

  today: "今日",
  overdueHeader: "期限切れ",

  fields: {
    stageName: "人物 ID",
    interactionFreq: "交流頻度",
    initiative: "主導性",
    emotionQuality: "感情の質",
    investmentBalance: "投入バランス",
    offlineStatus: "対面状況",
    upgradeSignals: "昇格シグナル",
    channel: "出会い経路"
  },

  nav: {
    pipeline: "パイプライン",
    pipelineList: "関係リスト",
    pipelineKanban: "段階カンバン",
    action: "アクション",
    actionCalendar: "アクションカレンダー",
    actionTimeline: "アクションタイムライン",
    insights: "インサイト",
    insightsDashboard: "ダッシュボード",
    settings: "設定",
    channels: "出会い経路"
  },

  channel: {
    pageTitle: "出会い経路",
    pageDesc: "各相手との出会い方を記録するタグを管理します。デフォルトは APP / ナンパ / 紹介。自由に追加・変更・削除できます。",
    addPlaceholder: "新しい経路名",
    addBtn: "+ 経路を追加",
    color: "色",
    inUseWarning: "この経路は使用中です。削除すると該当レコードの経路は空になります。",
    empty: "経路がありません"
  },

  page: {
    kanbanDesc: "段階間でカードをドラッグして関係を可視化・管理します",
    listDesc: "全関係のテーブル表示。ここで絞り込み・編集・情報補完を行います",
    calendarDesc: "各関係の今後のアクションと超過アクションを可視化・管理します",
    dashboardTitle: "関係パイプライン概要",
    dashboardDesc: "主要指標を集計・可視化し、段階分布、交流頻度、感情の質、アクション完遂率を評価します。"
  },

  Stage: {
    INTRO: "認知期",
    COMFORT: "安心期",
    FLIRT: "駆け引き",
    UPGRADE: "昇格期",
    COOLING: "冷却期",
    ENDED: "終了"
  },
  InteractionFrequency: { HIGH: "高 (ほぼ毎日)", MEDIUM: "中 (週 2–3)", LOW: "低 (週 1 以下)", NONE: "なし" },
  InitiativeDirection: { SELF: "自分から多い", OTHER: "相手から多い", BALANCED: "均衡" },
  EmotionQuality: {
    NEUTRAL: "情緒なし (情報交換)",
    POSITIVE: "良好 (楽しい / 期待感)",
    VOLATILE: "起伏 (駆け引き)",
    DRAINING: "消耗 (不安 / 冷淡)"
  },
  InvestmentBalance: { SELF_MORE: "自分が明らかに多い", BALANCED: "均衡", OTHER_MORE: "相手が多い" },
  OfflineStatus: { NEVER: "未対面", ONCE: "1 回会った", MULTIPLE: "複数回" },
  UpgradeSignal: {
    CARE: "気遣い",
    INVITE: "誘い",
    TIME_GIVE: "時間を割く",
    BODY_LANGUAGE: "ボディランゲージ",
    EMOTIONAL_DEPENDENCE: "感情的依存"
  },
  NextAction: {
    KEEP_CHAT: "会話を続ける",
    LIGHT_UPGRADE: "軽い昇格テスト",
    CLEAR_INVITE: "明確な誘い",
    SLOW_DOWN: "ペースを落とす",
    OBSERVE: "観察に降格",
    END: "終了"
  },
  Priority: { HIGH: "高", MEDIUM: "中", LOW: "低", UNKNOWN: "未定" },
  Advisor: { RULES: "ルール", AI: "AI" },
  Reason: {
    ALREADY_ENDED: "既に終了",
    DRAINING_ONE_SIDED: "一方的な消耗",
    COOLING_NO_CONTACT: "冷却 + 連絡なし",
    COOLING_STAGE: "冷却期",
    NO_CONTACT_LATE: "後期の連絡途絶",
    VOLATILE_EMOTION: "感情の起伏大",
    SELF_OVERINVESTING: "自分の投入過多",
    READY_FOR_INVITE: "十分な信号、明確に誘える",
    SIGNALS_IN_INTRO: "認知期に昇格信号",
    EARLY_SIGNAL: "早期の良い信号",
    UPGRADE_CONSOLIDATE: "昇格期は固める",
    MAINTAIN: "現状維持"
  },

  weekday: { Mon: "月", Tue: "火", Wed: "水", Thu: "木", Fri: "金", Sat: "土", Sun: "日" },

  stat: {
    active: "アクティブな関係",
    activeCount: "アクティブ数",
    ddlSetRate: "DDL 設定率"
  },
  chart: {
    stage: "段階の分布",
    stageSub: "各段階の関係数。",
    emotion: "感情の質",
    emotionSub: "感情の質の割合。",
    freq: "交流頻度",
    freqSub: "交流頻度の分布。",
    action: "次のアクション分布",
    actionSub: "次のアクション別の集中とボトルネック。"
  },
  pivot: {
    title: "段階 × 感情 ピボット",
    subtitle: "段階と感情の質のクロス集計。"
  }
};
