import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import type {
  Connection,
  EmotionQuality,
  InteractionFrequency,
  NextAction,
  Stage
} from "../types";
import { Chip } from "../components/Chip";
import { ConnectionCard } from "../components/ConnectionCard";
import { NewConnectionForm } from "../components/NewConnectionForm";
import {
  emotionColor,
  initiativeColor,
  interactionFreqColor,
  investmentColor,
  nextActionColor,
  offlineColor,
  priorityColor,
  stageColor,
  upgradeSignalColor
} from "../airtableColors";

const stageOptions: Stage[] = ["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"];
const freqOptions: InteractionFrequency[] = ["HIGH", "MEDIUM", "LOW", "NONE"];
const emotionOptions: EmotionQuality[] = ["NEUTRAL", "POSITIVE", "VOLATILE", "DRAINING"];

export function RelationshipList() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [stageFilter, setStageFilter] = useState<Stage | "">("");
  const [freqFilter, setFreqFilter] = useState<InteractionFrequency | "">("");
  const [emotionFilter, setEmotionFilter] = useState<EmotionQuality | "">("");

  const reload = useCallback(async () => {
    try {
      setError(null);
      const list = await api.listConnections();
      setConnections(list);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    return connections.filter((c) => {
      if (stageFilter && c.stage !== stageFilter) return false;
      if (freqFilter && c.interactionFreq !== freqFilter) return false;
      if (emotionFilter && c.emotionQuality !== emotionFilter) return false;
      return true;
    });
  }, [connections, stageFilter, freqFilter, emotionFilter]);

  const handleOverride = async (id: string, action: NextAction | null, reason?: string | null) => {
    await api.setOverride(id, action, reason);
    await reload();
  };

  const handleDelete = async (id: string) => {
    await api.deleteConnection(id);
    setExpandedId(null);
    await reload();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            <span style={{ color: "#7a9cc6" }}>Pipeline</span>
            <span style={{ color: "#546e87" }}> › </span>
            <span>{t("nav.pipelineList")}</span>
          </div>
        </div>
        <button onClick={() => setShowAdd((v) => !v)} style={styles.addBtn}>
          + {t("add")}
        </button>
      </div>

      <div style={styles.filterBar}>
        <FilterSelect
          label={t("stage")}
          value={stageFilter}
          onChange={(v) => setStageFilter(v as Stage | "")}
          options={stageOptions.map((s) => ({ value: s, label: t(`Stage.${s}`) }))}
        />
        <FilterSelect
          label={t("fields.interactionFreq")}
          value={freqFilter}
          onChange={(v) => setFreqFilter(v as InteractionFrequency | "")}
          options={freqOptions.map((f) => ({ value: f, label: t(`InteractionFrequency.${f}`) }))}
        />
        <FilterSelect
          label={t("fields.emotionQuality")}
          value={emotionFilter}
          onChange={(v) => setEmotionFilter(v as EmotionQuality | "")}
          options={emotionOptions.map((e) => ({ value: e, label: t(`EmotionQuality.${e}`) }))}
        />
        <span style={styles.recordCount}>
          {filtered.length} / {connections.length}
        </span>
      </div>

      {showAdd && (
        <div style={styles.addPanel}>
          <NewConnectionForm
            onCreated={() => {
              setShowAdd(false);
              reload();
            }}
          />
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>{t("fields.stageName")}</th>
              <th style={styles.th}>{t("lastInteraction")}</th>
              <th style={styles.th}>{t("fields.interactionFreq")}</th>
              <th style={styles.th}>{t("fields.initiative")}</th>
              <th style={styles.th}>{t("fields.emotionQuality")}</th>
              <th style={styles.th}>{t("fields.investmentBalance")}</th>
              <th style={styles.th}>{t("fields.offlineStatus")}</th>
              <th style={styles.th}>{t("fields.upgradeSignals")}</th>
              <th style={styles.th}>{t("nextAction")}</th>
              <th style={styles.th}>{t("actionDueAtLabel")}</th>
              <th style={styles.th}>{t("priority")}</th>
              <th style={styles.th}>{t("advisorMode")}</th>
              <th style={styles.thAction} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={13} style={styles.emptyCell}>...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={13} style={styles.emptyCell}>{t("empty")}</td></tr>
            ) : (
              filtered.flatMap((c) => [
                <tr
                  key={c.id}
                  style={styles.row}
                  onClick={() => setExpandedId((id) => (id === c.id ? null : c.id))}
                >
                  <td style={styles.td}>
                    <div style={styles.stageCell}>
                      <Chip label={t(`Stage.${c.stage}`)} color={stageColor[c.stage]} />
                      <span style={styles.name}>{c.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{c.lastInteractionAt?.slice(0, 10) ?? "—"}</td>
                  <td style={styles.td}>
                    <Chip label={t(`InteractionFrequency.${c.interactionFreq}`)} color={interactionFreqColor[c.interactionFreq]} />
                  </td>
                  <td style={styles.td}>
                    <Chip label={t(`InitiativeDirection.${c.initiative}`)} color={initiativeColor[c.initiative]} />
                  </td>
                  <td style={styles.td}>
                    <Chip label={t(`EmotionQuality.${c.emotionQuality}`)} color={emotionColor[c.emotionQuality]} />
                  </td>
                  <td style={styles.td}>
                    <Chip label={t(`InvestmentBalance.${c.investmentBalance}`)} color={investmentColor[c.investmentBalance]} />
                  </td>
                  <td style={styles.td}>
                    <Chip label={t(`OfflineStatus.${c.offlineStatus}`)} color={offlineColor[c.offlineStatus]} />
                  </td>
                  <td style={styles.td}>
                    {c.upgradeSignals.length === 0 ? (
                      <Chip label={t("noSignals")} color="orangeLight2" />
                    ) : (
                      <div style={styles.chipRow}>
                        {c.upgradeSignals.map((s) => (
                          <Chip key={s} label={t(`UpgradeSignal.${s}`)} color={upgradeSignalColor[s]} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <Chip label={t(`NextAction.${c.nextAction}`)} color={nextActionColor[c.nextAction]} />
                  </td>
                  <td style={styles.td}>{c.actionDueAt?.slice(0, 10) ?? "—"}</td>
                  <td style={styles.td}>
                    <Chip label={t(`Priority.${c.priorityAdvice}`)} color={priorityColor[c.priorityAdvice]} />
                    <span style={styles.scoreText}> · {c.priorityScore}</span>
                  </td>
                  <td style={styles.td}>
                    <Chip
                      label={t(`Advisor.${c.advisor}`)}
                      color={c.advisor === "AI" ? "greenLight2" : "blueLight2"}
                    />
                  </td>
                  <td style={styles.tdAction}>
                    <span style={styles.expandIcon}>{expandedId === c.id ? "▾" : "▸"}</span>
                  </td>
                </tr>,
                expandedId === c.id ? (
                  <tr key={`${c.id}-detail`}>
                    <td colSpan={13} style={styles.detailCell}>
                      <ConnectionCard connection={c} onOverride={handleOverride} onDelete={handleDelete} />
                    </td>
                  </tr>
                ) : null
              ])
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.filterSelect}>
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { flex: 1, padding: 24, color: "#e3edf5", overflow: "auto", display: "flex", flexDirection: "column", gap: 12 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  breadcrumb: { fontSize: 14 },
  addBtn: {
    background: "#4b6cb7",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14
  },
  filterBar: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  filterSelect: {
    background: "#1a3550",
    color: "#cfe1f2",
    border: "1px solid #2c4f70",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 13
  },
  recordCount: { color: "#7a9cc6", fontSize: 13, marginLeft: "auto" },
  addPanel: { marginTop: 4 },
  error: { background: "#3a1a1a", color: "#ff9090", padding: 10, borderRadius: 8, border: "1px solid #5a2a2a" },
  tableWrap: {
    border: "1px solid #1f3b58",
    borderRadius: 10,
    overflow: "auto",
    background: "#0f2136"
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  headerRow: { background: "#142940" },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "#7a9cc6",
    fontWeight: 500,
    fontSize: 12,
    whiteSpace: "nowrap",
    borderBottom: "1px solid #1f3b58"
  },
  thAction: { width: 32, borderBottom: "1px solid #1f3b58" },
  row: { cursor: "pointer", borderBottom: "1px solid #17304a" },
  td: { padding: "10px 12px", verticalAlign: "middle", whiteSpace: "nowrap" },
  tdAction: { padding: "10px 8px", textAlign: "center", color: "#7a9cc6" },
  expandIcon: { fontSize: 12 },
  stageCell: { display: "flex", gap: 10, alignItems: "center" },
  name: { fontWeight: 600, color: "#e3edf5" },
  chipRow: { display: "flex", gap: 4, flexWrap: "wrap" },
  scoreText: { color: "#7a9cc6", fontSize: 12 },
  emptyCell: { padding: 24, textAlign: "center", color: "#7a9cc6" },
  detailCell: { padding: 16, background: "#0a1a2a", borderTop: "1px solid #1f3b58", borderBottom: "1px solid #1f3b58" }
};
