import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../api";
import type {
  Connection,
  EmotionQuality,
  InteractionFrequency,
  NextAction,
  Stage
} from "../types";
import { Chip } from "../components/Chip";
import {
  airtableChip,
  emotionColor,
  interactionFreqColor,
  investmentColor,
  nextActionColor,
  offlineColor,
  priorityColor,
  stageColor,
  upgradeSignalColor
} from "../airtableColors";

const stageOrder: Stage[] = ["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"];
const emotionOrder: EmotionQuality[] = ["NEUTRAL", "POSITIVE", "VOLATILE", "DRAINING"];
const freqOrder: InteractionFrequency[] = ["HIGH", "MEDIUM", "LOW", "NONE"];
const actionOrder: NextAction[] = ["KEEP_CHAT", "LIGHT_UPGRADE", "CLEAR_INVITE", "SLOW_DOWN", "OBSERVE", "END"];

export function InsightsDashboard() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<Stage | "">("");
  const [emotionFilter, setEmotionFilter] = useState<EmotionQuality | "">("");
  const [freqFilter, setFreqFilter] = useState<InteractionFrequency | "">("");

  useEffect(() => {
    api.listConnections().then((list) => {
      setConnections(list);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () =>
      connections.filter((c) => {
        if (stageFilter && c.stage !== stageFilter) return false;
        if (emotionFilter && c.emotionQuality !== emotionFilter) return false;
        if (freqFilter && c.interactionFreq !== freqFilter) return false;
        return true;
      }),
    [connections, stageFilter, emotionFilter, freqFilter]
  );

  const active = useMemo(() => filtered.filter((c) => c.stage !== "ENDED"), [filtered]);
  const ddlSetRate = useMemo(() => {
    if (active.length === 0) return 0;
    const set = active.filter((c) => c.actionDueAt).length;
    return Math.round((set / active.length) * 100);
  }, [active]);

  const byStage = useMemo(
    () =>
      stageOrder.map((s) => ({
        key: s,
        label: t(`Stage.${s}`),
        value: filtered.filter((c) => c.stage === s).length,
        color: airtableChip[stageColor[s]].fg
      })),
    [filtered, t]
  );

  const byEmotion = useMemo(
    () =>
      emotionOrder.map((e) => ({
        key: e,
        label: t(`EmotionQuality.${e}`),
        value: filtered.filter((c) => c.emotionQuality === e).length,
        color: airtableChip[emotionColor[e]].fg
      })).filter((d) => d.value > 0),
    [filtered, t]
  );

  const byFreq = useMemo(
    () =>
      freqOrder.map((f) => ({
        key: f,
        label: t(`InteractionFrequency.${f}`),
        value: filtered.filter((c) => c.interactionFreq === f).length,
        color: airtableChip[interactionFreqColor[f]].fg
      })).filter((d) => d.value > 0),
    [filtered, t]
  );

  const byAction = useMemo(
    () =>
      actionOrder.map((a) => ({
        key: a,
        label: t(`NextAction.${a}`),
        value: filtered.filter((c) => c.nextAction === a).length,
        color: airtableChip[nextActionColor[a]].fg
      })),
    [filtered, t]
  );

  const pivot = useMemo(() => {
    return stageOrder.map((s) => {
      const row: Record<string, number | string> = { stage: s };
      let rowTotal = 0;
      for (const e of emotionOrder) {
        const count = filtered.filter((c) => c.stage === s && c.emotionQuality === e).length;
        row[e] = count;
        rowTotal += count;
      }
      row.total = rowTotal;
      return row;
    });
  }, [filtered]);

  const pivotColTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let grand = 0;
    for (const e of emotionOrder) {
      totals[e] = filtered.filter((c) => c.emotionQuality === e).length;
      grand += totals[e];
    }
    totals.total = grand;
    return totals;
  }, [filtered]);

  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>
        <span style={{ color: "#7a9cc6" }}>Insights</span>
        <span style={{ color: "#546e87" }}> › </span>
        <span>{t("nav.insightsDashboard")}</span>
      </div>

      <h2 style={styles.title}>Connection Pipeline Overview</h2>
      <p style={styles.description}>
        Aggregate and visualize key metrics to evaluate relationship stage distribution,
        interaction frequency, emotional quality, and action completion rates.
      </p>

      <div style={styles.filterBar}>
        <Select value={stageFilter} onChange={(v) => setStageFilter(v as Stage | "")} label={t("stage")}
          options={stageOrder.map((s) => ({ value: s, label: t(`Stage.${s}`) }))} />
        <Select value={emotionFilter} onChange={(v) => setEmotionFilter(v as EmotionQuality | "")} label={t("fields.emotionQuality")}
          options={emotionOrder.map((e) => ({ value: e, label: t(`EmotionQuality.${e}`) }))} />
        <Select value={freqFilter} onChange={(v) => setFreqFilter(v as InteractionFrequency | "")} label={t("fields.interactionFreq")}
          options={freqOrder.map((f) => ({ value: f, label: t(`InteractionFrequency.${f}`) }))} />
      </div>

      {loading ? (
        <div style={{ color: "#7a9cc6" }}>...</div>
      ) : (
        <>
          <div style={styles.statGrid}>
            <StatCard title={t("stat.active")} value={active.length.toString()} />
            <StatCard title={t("stat.activeCount")} value={filtered.length.toString()} />
            <StatCard title={t("stat.ddlSetRate")} value={`${ddlSetRate}%`} />
          </div>

          <div style={styles.chartGrid}>
            <ChartCard title={t("chart.stage")} subtitle={t("chart.stageSub")}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byStage}>
                  <CartesianGrid stroke="#1f3b58" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#7a9cc6" fontSize={11} interval={0} />
                  <YAxis stroke="#7a9cc6" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(75,108,183,0.15)" }} />
                  <Bar dataKey="value" fill="#4b6cb7">
                    {byStage.map((d) => <Cell key={d.key} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t("chart.emotion")} subtitle={t("chart.emotionSub")}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byEmotion} dataKey="value" nameKey="label" innerRadius={40} outerRadius={80}
                    label={(entry: { value?: number; percent?: number }) => `${Math.round((entry.percent ?? 0) * 100)}%`}>
                    {byEmotion.map((d) => <Cell key={d.key} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#cfe1f2" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t("chart.freq")} subtitle={t("chart.freqSub")}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byFreq} dataKey="value" nameKey="label" outerRadius={80}
                    label={(entry: { value?: number; percent?: number }) => `${Math.round((entry.percent ?? 0) * 100)}%`}>
                    {byFreq.map((d) => <Cell key={d.key} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#cfe1f2" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t("chart.action")} subtitle={t("chart.actionSub")}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byAction}>
                  <CartesianGrid stroke="#1f3b58" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#7a9cc6" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis stroke="#7a9cc6" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(75,108,183,0.15)" }} />
                  <Bar dataKey="value" fill="#4b6cb7">
                    {byAction.map((d) => <Cell key={d.key} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div style={styles.pivotCard}>
            <div style={styles.cardTitle}>{t("pivot.title")}</div>
            <div style={styles.cardSubtitle}>{t("pivot.subtitle")}</div>
            <table style={styles.pivotTable}>
              <thead>
                <tr>
                  <th style={styles.pivotTh}>{t("stage")}, {t("fields.emotionQuality")}</th>
                  {emotionOrder.map((e) => (
                    <th key={e} style={styles.pivotTh}>
                      <Chip label={t(`EmotionQuality.${e}`)} color={emotionColor[e]} />
                    </th>
                  ))}
                  <th style={styles.pivotTh}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pivot.map((row) => (
                  <tr key={row.stage as string}>
                    <td style={styles.pivotTd}>
                      <Chip label={t(`Stage.${row.stage as Stage}`)} color={stageColor[row.stage as Stage]} />
                    </td>
                    {emotionOrder.map((e) => (
                      <td key={e} style={styles.pivotTdNum}>{row[e] as number}</td>
                    ))}
                    <td style={{ ...styles.pivotTdNum, fontWeight: 600 }}>{row.total as number}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...styles.pivotTd, fontWeight: 600 }}>Total</td>
                  {emotionOrder.map((e) => (
                    <td key={e} style={{ ...styles.pivotTdNum, fontWeight: 600 }}>{pivotColTotals[e]}</td>
                  ))}
                  <td style={{ ...styles.pivotTdNum, fontWeight: 600 }}>{pivotColTotals.total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.summaryCard}>
            <div style={styles.cardTitle}>Connections Relationship & Quality Judgement Overview</div>
            <div style={styles.tableWrap}>
              <table style={styles.summaryTable}>
                <thead>
                  <tr>
                    <th style={styles.pivotTh}>{t("stage")}</th>
                    <th style={styles.pivotTh}>{t("fields.emotionQuality")}</th>
                    <th style={styles.pivotTh}>{t("fields.investmentBalance")}</th>
                    <th style={styles.pivotTh}>{t("fields.offlineStatus")}</th>
                    <th style={styles.pivotTh}>{t("fields.upgradeSignals")}</th>
                    <th style={styles.pivotTh}>{t("score")}</th>
                    <th style={styles.pivotTh}>{t("priority")}</th>
                    <th style={styles.pivotTh}>{t("nextAction")}</th>
                    <th style={styles.pivotTh}>{t("actionDueAtLabel")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td style={styles.pivotTd}><Chip label={t(`Stage.${c.stage}`)} color={stageColor[c.stage]} /></td>
                      <td style={styles.pivotTd}><Chip label={t(`EmotionQuality.${c.emotionQuality}`)} color={emotionColor[c.emotionQuality]} /></td>
                      <td style={styles.pivotTd}><Chip label={t(`InvestmentBalance.${c.investmentBalance}`)} color={investmentColor[c.investmentBalance]} /></td>
                      <td style={styles.pivotTd}><Chip label={t(`OfflineStatus.${c.offlineStatus}`)} color={offlineColor[c.offlineStatus]} /></td>
                      <td style={styles.pivotTd}>
                        {c.upgradeSignals.length === 0
                          ? <Chip label={t("noSignals")} color="orangeLight2" />
                          : (
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {c.upgradeSignals.map((s) => (
                                <Chip key={s} label={t(`UpgradeSignal.${s}`)} color={upgradeSignalColor[s]} />
                              ))}
                            </div>
                          )}
                      </td>
                      <td style={styles.pivotTdNum}>{c.priorityScore}</td>
                      <td style={styles.pivotTd}><Chip label={t(`Priority.${c.priorityAdvice}`)} color={priorityColor[c.priorityAdvice]} /></td>
                      <td style={styles.pivotTd}><Chip label={t(`NextAction.${c.nextAction}`)} color={nextActionColor[c.nextAction]} /></td>
                      <td style={styles.pivotTd}>{c.actionDueAt?.slice(0, 10) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.filterSelect}>
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={styles.chartCard}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardSubtitle}>{subtitle}</div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "#142940",
  border: "1px solid #2c4f70",
  borderRadius: 6,
  fontSize: 12,
  color: "#e3edf5"
};

const styles: Record<string, React.CSSProperties> = {
  page: { flex: 1, padding: 24, color: "#e3edf5", overflow: "auto", display: "flex", flexDirection: "column", gap: 16 },
  breadcrumb: { fontSize: 14 },
  title: { margin: "4px 0 4px", fontSize: 28 },
  description: { color: "#7a9cc6", margin: 0, fontSize: 13, maxWidth: 880 },
  filterBar: { display: "flex", gap: 8, marginBottom: 4 },
  filterSelect: {
    background: "#1a3550",
    color: "#cfe1f2",
    border: "1px solid #2c4f70",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 13
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12
  },
  statCard: {
    background: "#0f2136",
    border: "1px solid #1f3b58",
    borderRadius: 10,
    padding: 18
  },
  statTitle: { color: "#4b9be0", fontSize: 13, fontWeight: 500 },
  statValue: { fontSize: 40, fontWeight: 300, marginTop: 6 },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
  },
  chartCard: {
    background: "#0f2136",
    border: "1px solid #1f3b58",
    borderRadius: 10,
    padding: 16
  },
  cardTitle: { fontSize: 15, fontWeight: 600 },
  cardSubtitle: { color: "#7a9cc6", fontSize: 12, marginTop: 2 },
  pivotCard: {
    background: "#0f2136",
    border: "1px solid #1f3b58",
    borderRadius: 10,
    padding: 16
  },
  pivotTable: { width: "100%", borderCollapse: "collapse", marginTop: 10, fontSize: 13 },
  pivotTh: {
    textAlign: "left",
    padding: "8px 10px",
    color: "#7a9cc6",
    fontWeight: 500,
    fontSize: 12,
    borderBottom: "1px solid #1f3b58"
  },
  pivotTd: { padding: "8px 10px", borderBottom: "1px solid #17304a", verticalAlign: "middle" },
  pivotTdNum: { padding: "8px 10px", borderBottom: "1px solid #17304a", textAlign: "right" as const },
  summaryCard: {
    background: "#0f2136",
    border: "1px solid #1f3b58",
    borderRadius: 10,
    padding: 16
  },
  tableWrap: { overflow: "auto", marginTop: 10 },
  summaryTable: { width: "100%", borderCollapse: "collapse", fontSize: 13 }
};
