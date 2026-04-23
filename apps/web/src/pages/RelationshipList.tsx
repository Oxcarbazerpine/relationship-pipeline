import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import type {
  Connection,
  ConnectionInput,
  EmotionQuality,
  InitiativeDirection,
  InteractionFrequency,
  InvestmentBalance,
  NextAction,
  OfflineStatus,
  Stage,
  UpgradeSignal
} from "../types";
import { Chip } from "../components/Chip";
import { EditableChipCell, EditableMultiChipCell, type ChipOption } from "../components/EditableChipCell";
import { RecordDetailPanel } from "../components/RecordDetailPanel";
import { defaultConnectionInput } from "../defaults";
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
const initiativeOptions: InitiativeDirection[] = ["SELF", "OTHER", "BALANCED"];
const investmentOptions: InvestmentBalance[] = ["SELF_MORE", "BALANCED", "OTHER_MORE"];
const offlineOptions: OfflineStatus[] = ["NEVER", "ONCE", "MULTIPLE"];
const upgradeOptions: UpgradeSignal[] = ["CARE", "INVITE", "TIME_GIVE", "BODY_LANGUAGE", "EMOTIONAL_DEPENDENCE"];
const nextActionOptions: NextAction[] = ["KEEP_CHAT", "LIGHT_UPGRADE", "CLEAR_INVITE", "SLOW_DOWN", "OBSERVE", "END"];

export function RelationshipList() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelState, setPanelState] = useState<{ mode: "new" | "edit" | "closed"; id: string | null }>(
    { mode: "closed", id: null }
  );
  const openId = panelState.mode === "edit" ? panelState.id : null;
  const setOpenId = (id: string | null) =>
    setPanelState(id ? { mode: "edit", id } : { mode: "closed", id: null });

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

  const handleOverride = async (id: string, action: NextAction | null) => {
    const updated = await api.setOverride(id, action);
    setConnections((cs) => cs.map((c) => (c.id === id ? updated : c)));
  };

  const handleDelete = async (id: string) => {
    await api.deleteConnection(id);
    setOpenId(null);
    await reload();
  };

  const applyPatch = useCallback(async (id: string, patch: Partial<ConnectionInput>) => {
    const snapshot = connections;
    setConnections((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } as Connection : c)));
    try {
      const updated = await api.patchConnection(id, patch);
      setConnections((cs) => cs.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      console.error(e);
      setConnections(snapshot);
      setError((e as Error).message);
    }
  }, [connections]);

  const setNextAction = useCallback(async (id: string, action: NextAction, suggested: NextAction) => {
    if (action === suggested) {
      await api.setOverride(id, null);
    } else {
      await api.setOverride(id, action);
    }
    await reload();
  }, [reload]);

  const clearOverride = useCallback(async (id: string) => {
    await api.setOverride(id, null);
    await reload();
  }, [reload]);

  const handleAdd = useCallback(() => {
    setPanelState({ mode: "new", id: null });
  }, []);

  const handlePanelSave = useCallback(async (input: ConnectionInput, existingId: string | null) => {
    if (existingId) {
      const updated = await api.updateConnection(existingId, input);
      setConnections((cs) => cs.map((c) => (c.id === existingId ? updated : c)));
      setPanelState({ mode: "closed", id: null });
    } else {
      const created = await api.createConnection(input);
      setConnections((cs) => [created, ...cs]);
      setPanelState({ mode: "closed", id: null });
    }
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            <span style={{ color: "#7a9cc6" }}>{t("nav.pipeline")}</span>
            <span style={{ color: "#546e87" }}> › </span>
            <span>{t("nav.pipelineList")}</span>
          </div>
        </div>
        <button onClick={handleAdd} style={styles.addBtn}>
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

      {error && <div style={styles.error}>{error}</div>}

      <RecordDetailPanel
        mode={panelState.mode}
        connection={panelState.mode === "edit" ? connections.find((c) => c.id === panelState.id) ?? null : null}
        onClose={() => setPanelState({ mode: "closed", id: null })}
        onSave={handlePanelSave}
        onDelete={handleDelete}
      />

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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} style={styles.emptyCell}>...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={12} style={styles.emptyCell}>{t("empty")}</td></tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  style={styles.row}
                  onClick={() => setOpenId(c.id)}
                >
                  <td style={styles.td}>
                    <div style={styles.stageCell}>
                      <EditableChipCell<Stage>
                        value={c.stage}
                        options={stageOptions.map((s) => ({ value: s, label: t(`Stage.${s}`), color: stageColor[s] }))}
                        onChange={(v) => applyPatch(c.id, { stage: v })}
                      />
                      <span style={styles.name}>{c.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{c.lastInteractionAt?.slice(0, 10) ?? "—"}</td>
                  <td style={styles.td}>
                    <EditableChipCell<InteractionFrequency>
                      value={c.interactionFreq}
                      options={freqOptions.map((f) => ({ value: f, label: t(`InteractionFrequency.${f}`), color: interactionFreqColor[f] }))}
                      onChange={(v) => applyPatch(c.id, { interactionFreq: v })}
                    />
                  </td>
                  <td style={styles.td}>
                    <EditableChipCell<InitiativeDirection>
                      value={c.initiative}
                      options={initiativeOptions.map((i) => ({ value: i, label: t(`InitiativeDirection.${i}`), color: initiativeColor[i] }))}
                      onChange={(v) => applyPatch(c.id, { initiative: v })}
                    />
                  </td>
                  <td style={styles.td}>
                    <EditableChipCell<EmotionQuality>
                      value={c.emotionQuality}
                      options={emotionOptions.map((e) => ({ value: e, label: t(`EmotionQuality.${e}`), color: emotionColor[e] }))}
                      onChange={(v) => applyPatch(c.id, { emotionQuality: v })}
                    />
                  </td>
                  <td style={styles.td}>
                    <EditableChipCell<InvestmentBalance>
                      value={c.investmentBalance}
                      options={investmentOptions.map((i) => ({ value: i, label: t(`InvestmentBalance.${i}`), color: investmentColor[i] }))}
                      onChange={(v) => applyPatch(c.id, { investmentBalance: v })}
                    />
                  </td>
                  <td style={styles.td}>
                    <EditableChipCell<OfflineStatus>
                      value={c.offlineStatus}
                      options={offlineOptions.map((o) => ({ value: o, label: t(`OfflineStatus.${o}`), color: offlineColor[o] }))}
                      onChange={(v) => applyPatch(c.id, { offlineStatus: v })}
                    />
                  </td>
                  <td style={styles.td}>
                    <EditableMultiChipCell<UpgradeSignal>
                      values={c.upgradeSignals}
                      options={upgradeOptions.map((u) => ({ value: u, label: t(`UpgradeSignal.${u}`), color: upgradeSignalColor[u] }))}
                      onChange={(v) => applyPatch(c.id, { upgradeSignals: v })}
                      emptyChip={{ label: t("noSignals"), color: "orangeLight2" }}
                    />
                  </td>
                  <td style={styles.td}>
                    <NextActionCell connection={c} t={t} onPick={setNextAction} onClear={clearOverride} />
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NextActionCell({
  connection: c,
  t,
  onPick,
  onClear
}: {
  connection: Connection;
  t: (k: string, o?: Record<string, unknown>) => string;
  onPick: (id: string, action: NextAction, suggested: NextAction) => Promise<void> | void;
  onClear: (id: string) => Promise<void> | void;
}) {
  const options: ChipOption<NextAction>[] = nextActionOptions.map((a) => ({
    value: a,
    label: t(`NextAction.${a}`),
    color: nextActionColor[a],
    recommendedTag: a === c.suggestedAction ? `★ ${t(`Advisor.${c.advisor}`)} ${t("recommended")}` : undefined
  }));
  return (
    <EditableChipCell<NextAction>
      value={c.nextAction}
      options={options}
      onChange={(v) => onPick(c.id, v, c.suggestedAction)}
      onClear={c.isOverridden ? () => onClear(c.id) : undefined}
      clearLabel={t("clearOverride")}
    />
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
