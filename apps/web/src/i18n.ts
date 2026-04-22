import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  zh: {
    translation: {
      title: "交往推进表",
      subtitle: "用系统管理投入与风险",
      trial: "7天免费试用，之后订阅",
      signIn: "使用社交账号登录",
      stage: "阶段",
      nextAction: "下一步动作",
      fields: {
        interactionFreq: "互动频率",
        initiative: "主动方向",
        emotionQuality: "情绪质量",
        investmentBalance: "投入一致性",
        offlineStatus: "线下状态",
        upgradeSignals: "升级信号",
        stageName: "人物 ID"
      },
      engineSuggests: "引擎建议",
      youOverrode: "你已覆盖",
      acceptSuggestion: "接受建议",
      override: "手动调整",
      overrideReason: "备注",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      newConnection: "新增对象",
      name: "代号",
      add: "添加",
      preview: "引擎预览",
      empty: "还没有记录，新建第一个对象开始追踪",
      Stage: {
        INTRO: "认识期",
        COMFORT: "舒适期",
        FLIRT: "暧昧期",
        UPGRADE: "升级期",
        COOLING: "冷却",
        ENDED: "终止"
      },
      InteractionFrequency: {
        HIGH: "高（几乎每天）",
        MEDIUM: "中（2–3 次）",
        LOW: "低（≤1 次）",
        NONE: "无"
      },
      InitiativeDirection: {
        SELF: "我主动",
        OTHER: "对方主动",
        BALANCED: "基本对等"
      },
      EmotionQuality: {
        NEUTRAL: "无情绪（信息交换）",
        POSITIVE: "正向（轻松 / 开心 / 被期待）",
        VOLATILE: "波动（拉扯 / 暧昧）",
        DRAINING: "消耗（焦虑 / 冷处理）"
      },
      InvestmentBalance: {
        SELF_MORE: "明显不对等（我 > 对方）",
        BALANCED: "基本一致",
        OTHER_MORE: "对方更高"
      },
      OfflineStatus: {
        NEVER: "未见",
        ONCE: "已见 1 次",
        MULTIPLE: "已见多次"
      },
      UpgradeSignal: {
        CARE: "主动关心",
        INVITE: "主动邀约",
        TIME_GIVE: "时间让渡（为你改安排）",
        BODY_LANGUAGE: "身体语言",
        EMOTIONAL_DEPENDENCE: "情绪依赖"
      },
      NextAction: {
        KEEP_CHAT: "继续聊天",
        LIGHT_UPGRADE: "轻升级测试（弱邀约）",
        CLEAR_INVITE: "明确邀约",
        SLOW_DOWN: "放缓投入",
        OBSERVE: "降级为观察",
        END: "结束"
      },
      Priority: {
        HIGH: "高",
        MEDIUM: "中",
        LOW: "低",
        UNKNOWN: "待定"
      },
      Advisor: {
        RULES: "规则",
        AI: "AI"
      },
      noSignals: "无",
      recommended: "推荐",
      clearOverride: "清除手动覆盖 (回到推荐)",
      daysSinceInteraction: "天数距离最后互动",
      daysUntilDue: "行动DDL剩余天数",
      advisorReason: "决策建议",
      confirmDelete: "确定删除这条记录吗?",
      score: "评分",
      priority: "优先级",
      advisorMode: "决策方式",
      aiUnavailable: "AI 接口不可用",
      lastInteraction: "最后互动",
      actionDueAtLabel: "行动 DDL",
      notesLabel: "决策理由",
      daysOverdue: "已超期 {{days}} 天",
      daysRemaining: "剩余 {{days}} 天",
      nav: {
        pipeline: "Pipeline",
        pipelineList: "Relationship List",
        pipelineKanban: "Stage Kanban",
        action: "Action",
        actionCalendar: "Action Calendar",
        actionTimeline: "Action Timeline",
        insights: "Insights",
        insightsDashboard: "Pipeline Dashboard"
      },
      today: "今天",
      overdueHeader: "超期行动",
      weekday: { Mon: "周一", Tue: "周二", Wed: "周三", Thu: "周四", Fri: "周五", Sat: "周六", Sun: "周日" },
      stat: {
        active: "Active Connections",
        activeCount: "Active Connections: Count",
        ddlSetRate: "Action DDL Set Rate"
      },
      chart: {
        stage: "关系阶段分布",
        stageSub: "按'当前阶段'字段显示各阶段的关系数量，清晰展现管道分布。",
        emotion: "情绪质量分布",
        emotionSub: "展示当前关系池中各类情绪质量的占比",
        freq: "互动频率分布",
        freqSub: "所有活跃关系的互动频率比例",
        action: "下一步动作分布",
        actionSub: "按'下一步动作'分组以查看各行动聚焦点及潜在瓶颈。"
      },
      pivot: {
        title: "关系阶段 × 情绪质量 分析透视表",
        subtitle: "本透视表用于交叉分析各人物关系在不同当前阶段与情绪质量的分布情况，帮助快速了解关系在各阶段的情绪状态。"
      },
      Reason: {
        ALREADY_ENDED: "已结束",
        DRAINING_ONE_SIDED: "单向消耗过久",
        COOLING_NO_CONTACT: "冷却期+断联",
        COOLING_STAGE: "进入冷却期",
        NO_CONTACT_LATE: "后期断联",
        VOLATILE_EMOTION: "情绪起伏过大",
        SELF_OVERINVESTING: "自己投入过多",
        READY_FOR_INVITE: "信号充分，可明确邀约",
        SIGNALS_IN_INTRO: "认识期已有多个升级信号",
        EARLY_SIGNAL: "早期出现积极信号",
        UPGRADE_CONSOLIDATE: "升级期先巩固",
        MAINTAIN: "维持现状"
      }
    }
  },
  en: {
    translation: {
      title: "Connection Pipeline",
      subtitle: "Manage investment and risk with a system",
      trial: "7-day free trial, then subscription",
      signIn: "Sign in with social account",
      stage: "Stage",
      nextAction: "Next Action",
      fields: {
        interactionFreq: "Interaction frequency",
        initiative: "Initiative",
        emotionQuality: "Emotion quality",
        investmentBalance: "Investment balance",
        offlineStatus: "Offline status",
        upgradeSignals: "Upgrade signals",
        stageName: "Name"
      },
      engineSuggests: "Engine suggests",
      youOverrode: "You overrode",
      acceptSuggestion: "Accept suggestion",
      override: "Override",
      overrideReason: "Note",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      newConnection: "New connection",
      name: "Label",
      add: "Add",
      preview: "Engine preview",
      empty: "No records yet. Add your first connection to start tracking.",
      Stage: {
        INTRO: "Intro",
        COMFORT: "Comfort",
        FLIRT: "Flirt",
        UPGRADE: "Upgrade",
        COOLING: "Cooling",
        ENDED: "Ended"
      },
      InteractionFrequency: { HIGH: "High", MEDIUM: "Medium", LOW: "Low", NONE: "None" },
      InitiativeDirection: { SELF: "Me more", OTHER: "Them more", BALANCED: "Balanced" },
      EmotionQuality: { NEUTRAL: "Neutral", POSITIVE: "Positive", VOLATILE: "Volatile", DRAINING: "Draining" },
      InvestmentBalance: { SELF_MORE: "I invest more", BALANCED: "Balanced", OTHER_MORE: "They invest more" },
      OfflineStatus: { NEVER: "Never met", ONCE: "Met once", MULTIPLE: "Met often" },
      UpgradeSignal: {
        CARE: "Proactive care",
        INVITE: "Proactive invite",
        TIME_GIVE: "Gives time",
        BODY_LANGUAGE: "Body language",
        EMOTIONAL_DEPENDENCE: "Emotional dependence"
      },
      NextAction: {
        KEEP_CHAT: "Keep chatting",
        LIGHT_UPGRADE: "Light upgrade",
        CLEAR_INVITE: "Clear invite",
        SLOW_DOWN: "Slow down",
        OBSERVE: "Observe",
        END: "End"
      },
      Reason: {
        ALREADY_ENDED: "Already ended",
        DRAINING_ONE_SIDED: "Draining + one-sided",
        COOLING_NO_CONTACT: "Cooling + no contact",
        COOLING_STAGE: "In cooling phase",
        NO_CONTACT_LATE: "No contact at a late stage",
        VOLATILE_EMOTION: "Volatile emotion",
        SELF_OVERINVESTING: "You're over-investing",
        READY_FOR_INVITE: "Enough signals, ready to invite",
        SIGNALS_IN_INTRO: "Signals already in intro",
        EARLY_SIGNAL: "Early positive signal",
        UPGRADE_CONSOLIDATE: "Consolidate in upgrade phase",
        MAINTAIN: "Maintain"
      },
      today: "Today",
      overdueHeader: "Overdue actions",
      weekday: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },
      stat: {
        active: "Active Connections",
        activeCount: "Active Connections: Count",
        ddlSetRate: "Action DDL Set Rate"
      },
      chart: {
        stage: "Stage distribution",
        stageSub: "Count of relationships per current stage, showing pipeline shape.",
        emotion: "Emotion quality",
        emotionSub: "Share of each emotion quality in active pool.",
        freq: "Interaction frequency",
        freqSub: "Distribution of interaction frequencies.",
        action: "Next action distribution",
        actionSub: "Grouped by recommended next action — focus and bottlenecks."
      },
      pivot: {
        title: "Stage × Emotion pivot",
        subtitle: "Cross-analyze relationships across stage and emotion quality. Rows: stage, columns: emotion, cells: count."
      }
    }
  },
  ja: {
    translation: {
      title: "関係性パイプライン",
      subtitle: "システムで投入とリスクを管理",
      trial: "7日間無料、その後サブスクリプション",
      signIn: "ソーシャルアカウントでログイン",
      stage: "段階",
      nextAction: "次のアクション",
      fields: {
        interactionFreq: "交流頻度",
        initiative: "主導性",
        emotionQuality: "感情の質",
        investmentBalance: "投入バランス",
        offlineStatus: "対面状況",
        upgradeSignals: "昇格シグナル",
        stageName: "人物 ID"
      },
      engineSuggests: "エンジン提案",
      youOverrode: "手動で上書き中",
      acceptSuggestion: "提案を受け入れる",
      override: "手動調整",
      overrideReason: "メモ",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      newConnection: "新規追加",
      name: "ラベル",
      add: "追加",
      preview: "エンジンプレビュー",
      empty: "記録がありません。最初の相手を追加してください。",
      Stage: {
        INTRO: "認知期",
        COMFORT: "安心期",
        FLIRT: "駆け引き",
        UPGRADE: "昇格期",
        COOLING: "冷却期",
        ENDED: "終了"
      },
      InteractionFrequency: { HIGH: "頻繁", MEDIUM: "中", LOW: "たまに", NONE: "なし" },
      InitiativeDirection: { SELF: "自分から多い", OTHER: "相手から多い", BALANCED: "均衡" },
      EmotionQuality: { NEUTRAL: "普通", POSITIVE: "良好", VOLATILE: "起伏", DRAINING: "消耗" },
      InvestmentBalance: { SELF_MORE: "自分が多い", BALANCED: "均衡", OTHER_MORE: "相手が多い" },
      OfflineStatus: { NEVER: "未対面", ONCE: "1回会った", MULTIPLE: "複数回" },
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
        OBSERVE: "観察",
        END: "終了"
      },
      Reason: {
        ALREADY_ENDED: "既に終了",
        DRAINING_ONE_SIDED: "一方的な消耗",
        COOLING_NO_CONTACT: "冷却+連絡なし",
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
      today: "今日",
      overdueHeader: "期限切れ",
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
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
