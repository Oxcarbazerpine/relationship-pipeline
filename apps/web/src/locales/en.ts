import type { TranslationResources } from "./zh";

export const en: TranslationResources = {
  title: "Connection Pipeline",
  subtitle: "Manage investment and risk with a system",
  trial: "7-day free trial, then subscription",
  signIn: "Sign in with social account",

  stage: "Stage",
  nextAction: "Next action",
  priority: "Priority",
  score: "Score",
  advisorMode: "Advisor",
  advisorReason: "Advisor rationale",
  lastInteraction: "Last interaction",
  actionDueAtLabel: "Action DDL",
  notesLabel: "Decision rationale",
  daysSinceInteraction: "Days since last interaction",
  daysUntilDue: "Days until DDL",
  daysOverdue: "{{days}} days overdue",
  daysRemaining: "{{days}} days remaining",

  add: "Add",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  confirmDelete: "Delete this record?",
  newConnection: "New connection",
  newRecordName: "New record",
  name: "Label",
  preview: "Engine preview",
  empty: "No records yet. Add your first connection to start tracking.",

  engineSuggests: "Engine suggests",
  youOverrode: "Manual override",
  acceptSuggestion: "Accept suggestion",
  override: "Override",
  overrideReason: "Note",
  recommended: "recommended",
  clearOverride: "Clear override (back to recommendation)",
  aiUnavailable: "AI endpoint unavailable",
  noSignals: "None",

  today: "Today",
  overdueHeader: "Overdue actions",

  fields: {
    stageName: "Name",
    interactionFreq: "Interaction frequency",
    initiative: "Initiative",
    emotionQuality: "Emotion quality",
    investmentBalance: "Investment balance",
    offlineStatus: "Offline status",
    upgradeSignals: "Upgrade signals",
    channel: "Channel"
  },

  nav: {
    pipeline: "Pipeline",
    pipelineList: "Relationship list",
    pipelineKanban: "Stage Kanban",
    action: "Action",
    actionCalendar: "Action calendar",
    actionTimeline: "Action timeline",
    insights: "Insights",
    insightsDashboard: "Pipeline dashboard",
    settings: "Settings",
    channels: "Channels"
  },

  channel: {
    pageTitle: "Acquaintance channels",
    pageDesc: "Manage the tags you use to record how you met each person. Defaults: APP, Cold approach, Introduction — add, rename, or delete freely.",
    addPlaceholder: "New channel name",
    addBtn: "+ Add channel",
    color: "Color",
    inUseWarning: "This channel is in use. Deleting it will clear the channel on those records.",
    empty: "No channels yet"
  },

  page: {
    kanbanDesc: "Visualize and manage relationship records by moving them across stages",
    listDesc: "Full tabular view of every relationship — filter, edit, fill in details here",
    calendarDesc: "Visualize and manage upcoming and overdue next actions for each relationship",
    dashboardTitle: "Connection Pipeline Overview",
    dashboardDesc: "Aggregate and visualize key metrics to evaluate relationship stage distribution, interaction frequency, emotional quality, and action completion rates."
  },

  Stage: {
    INTRO: "Intro",
    COMFORT: "Comfort",
    FLIRT: "Flirt",
    UPGRADE: "Upgrade",
    COOLING: "Cooling",
    ENDED: "Ended"
  },
  InteractionFrequency: {
    HIGH: "High (near daily)",
    MEDIUM: "Medium (2–3 / week)",
    LOW: "Low (≤1 / week)",
    NONE: "None"
  },
  InitiativeDirection: {
    SELF: "I initiate",
    OTHER: "They initiate",
    BALANCED: "Balanced"
  },
  EmotionQuality: {
    NEUTRAL: "Neutral (info exchange)",
    POSITIVE: "Positive (easy / warm)",
    VOLATILE: "Volatile (push-pull)",
    DRAINING: "Draining (anxious / cold)"
  },
  InvestmentBalance: {
    SELF_MORE: "Clearly uneven (me > them)",
    BALANCED: "Roughly balanced",
    OTHER_MORE: "They invest more"
  },
  OfflineStatus: {
    NEVER: "Never met",
    ONCE: "Met once",
    MULTIPLE: "Met multiple times"
  },
  UpgradeSignal: {
    CARE: "Proactive care",
    INVITE: "Proactive invite",
    TIME_GIVE: "Gives time",
    BODY_LANGUAGE: "Body language",
    EMOTIONAL_DEPENDENCE: "Emotional dependence"
  },
  NextAction: {
    KEEP_CHAT: "Keep chatting",
    LIGHT_UPGRADE: "Light upgrade (soft invite)",
    CLEAR_INVITE: "Clear invite",
    SLOW_DOWN: "Slow down",
    OBSERVE: "Downgrade to observe",
    END: "End"
  },
  Priority: {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
    UNKNOWN: "Unknown"
  },
  Advisor: {
    RULES: "Rules",
    AI: "AI"
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

  weekday: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },

  stat: {
    active: "Active connections",
    activeCount: "Active count",
    ddlSetRate: "Action DDL set rate"
  },
  chart: {
    stage: "Stage distribution",
    stageSub: "Count of relationships per current stage — shows pipeline shape.",
    emotion: "Emotion quality",
    emotionSub: "Share of each emotion quality in the active pool.",
    freq: "Interaction frequency",
    freqSub: "Distribution of interaction frequencies.",
    action: "Next action distribution",
    actionSub: "Grouped by recommended next action — focus and bottlenecks."
  },
  pivot: {
    title: "Stage × Emotion pivot",
    subtitle: "Cross-analyze relationships across stage and emotion quality. Rows: stage, columns: emotion, cells: count."
  }
};
