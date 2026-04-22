export const zh = {
  title: "交往推进表",
  subtitle: "用系统管理投入与风险",
  trial: "7 天免费试用,之后订阅",
  signIn: "使用社交账号登录",

  stage: "阶段",
  nextAction: "下一步动作",
  priority: "优先级",
  score: "评分",
  advisorMode: "决策方式",
  advisorReason: "决策建议",
  lastInteraction: "最后互动",
  actionDueAtLabel: "行动 DDL",
  notesLabel: "决策理由",
  daysSinceInteraction: "天数距离最后互动",
  daysUntilDue: "行动 DDL 剩余天数",
  daysOverdue: "已超期 {{days}} 天",
  daysRemaining: "剩余 {{days}} 天",

  add: "添加",
  save: "保存",
  cancel: "取消",
  delete: "删除",
  confirmDelete: "确定删除这条记录吗?",
  newConnection: "新增对象",
  name: "代号",
  preview: "引擎预览",
  empty: "还没有记录,新建第一个对象开始追踪",

  engineSuggests: "引擎建议",
  youOverrode: "你已覆盖",
  acceptSuggestion: "接受建议",
  override: "手动调整",
  overrideReason: "备注",
  recommended: "推荐",
  clearOverride: "清除手动覆盖 (回到推荐)",
  aiUnavailable: "AI 接口不可用",
  noSignals: "无",

  today: "今天",
  overdueHeader: "超期行动",

  fields: {
    stageName: "人物 ID",
    interactionFreq: "互动频率",
    initiative: "主动方向",
    emotionQuality: "情绪质量",
    investmentBalance: "投入一致性",
    offlineStatus: "线下状态",
    upgradeSignals: "升级信号"
  },

  nav: {
    pipeline: "管道",
    pipelineList: "关系列表",
    pipelineKanban: "阶段看板",
    action: "行动",
    actionCalendar: "行动日历",
    actionTimeline: "行动时间线",
    insights: "洞察",
    insightsDashboard: "管道仪表盘"
  },

  page: {
    kanbanDesc: "通过在阶段间拖动卡片来可视化管理关系",
    listDesc: "所有关系的完整表格视图,可在此筛选、编辑和补齐数据",
    calendarDesc: "查看与管理每段关系即将到来和已超期的下一步动作",
    dashboardTitle: "关系管道总览",
    dashboardDesc: "聚合并可视化关键指标,用于评估关系的阶段分布、互动频率、情绪质量和行动完成率。"
  },

  Stage: {
    INTRO: "认识期",
    COMFORT: "舒适期",
    FLIRT: "暧昧期",
    UPGRADE: "升级期",
    COOLING: "冷却",
    ENDED: "终止"
  },
  InteractionFrequency: {
    HIGH: "高(几乎每天)",
    MEDIUM: "中(2–3 次)",
    LOW: "低(≤1 次)",
    NONE: "无"
  },
  InitiativeDirection: {
    SELF: "我主动",
    OTHER: "对方主动",
    BALANCED: "基本对等"
  },
  EmotionQuality: {
    NEUTRAL: "无情绪(信息交换)",
    POSITIVE: "正向(轻松 / 开心 / 被期待)",
    VOLATILE: "波动(拉扯 / 暧昧)",
    DRAINING: "消耗(焦虑 / 冷处理)"
  },
  InvestmentBalance: {
    SELF_MORE: "明显不对等(我 > 对方)",
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
    TIME_GIVE: "时间让渡(为你改安排)",
    BODY_LANGUAGE: "身体语言",
    EMOTIONAL_DEPENDENCE: "情绪依赖"
  },
  NextAction: {
    KEEP_CHAT: "继续聊天",
    LIGHT_UPGRADE: "轻升级测试(弱邀约)",
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
  Reason: {
    ALREADY_ENDED: "已结束",
    DRAINING_ONE_SIDED: "单向消耗过久",
    COOLING_NO_CONTACT: "冷却期 + 断联",
    COOLING_STAGE: "进入冷却期",
    NO_CONTACT_LATE: "后期断联",
    VOLATILE_EMOTION: "情绪起伏过大",
    SELF_OVERINVESTING: "自己投入过多",
    READY_FOR_INVITE: "信号充分,可明确邀约",
    SIGNALS_IN_INTRO: "认识期已有多个升级信号",
    EARLY_SIGNAL: "早期出现积极信号",
    UPGRADE_CONSOLIDATE: "升级期先巩固",
    MAINTAIN: "维持现状"
  },

  weekday: { Mon: "周一", Tue: "周二", Wed: "周三", Thu: "周四", Fri: "周五", Sat: "周六", Sun: "周日" },

  stat: {
    active: "活跃关系",
    activeCount: "活跃关系数",
    ddlSetRate: "DDL 设置率"
  },
  chart: {
    stage: "关系阶段分布",
    stageSub: "按'当前阶段'字段显示各阶段的关系数量,清晰展现管道分布。",
    emotion: "情绪质量分布",
    emotionSub: "展示当前关系池中各类情绪质量的占比。",
    freq: "互动频率分布",
    freqSub: "所有活跃关系的互动频率比例。",
    action: "下一步动作分布",
    actionSub: "按'下一步动作'分组以查看各行动聚焦点及潜在瓶颈。"
  },
  pivot: {
    title: "关系阶段 × 情绪质量 透视",
    subtitle: "交叉分析各人物在不同阶段与情绪质量的分布,快速了解各阶段的情绪状态。"
  }
};

export type TranslationResources = typeof zh;
