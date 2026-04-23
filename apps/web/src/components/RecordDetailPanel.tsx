import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { EditableChipCell, EditableMultiChipCell, type ChipOption } from "./EditableChipCell";
import { Chip } from "./Chip";
import { useChannels } from "../ChannelsContext";
import type { AirtableColor } from "../airtableColors";
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
import { buildDefaultConnectionInput } from "../defaults";

const stageOptions: Stage[] = ["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"];
const freqOptions: InteractionFrequency[] = ["HIGH", "MEDIUM", "LOW", "NONE"];
const emotionOptions: EmotionQuality[] = ["NEUTRAL", "POSITIVE", "VOLATILE", "DRAINING"];
const initiativeOptions: InitiativeDirection[] = ["SELF", "OTHER", "BALANCED"];
const investmentOptions: InvestmentBalance[] = ["SELF_MORE", "BALANCED", "OTHER_MORE"];
const offlineOptions: OfflineStatus[] = ["NEVER", "ONCE", "MULTIPLE"];
const upgradeOptions: UpgradeSignal[] = ["CARE", "INVITE", "TIME_GIVE", "BODY_LANGUAGE", "EMOTIONAL_DEPENDENCE"];
const nextActionOptions: NextAction[] = ["KEEP_CHAT", "LIGHT_UPGRADE", "CLEAR_INVITE", "SLOW_DOWN", "OBSERVE", "END"];

type Mode = "new" | "edit" | "closed";

interface Props {
  mode: Mode;
  connection: Connection | null;
  onSave: (input: ConnectionInput, existingId: string | null) => Promise<void>;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
}

function toInput(c: Connection): ConnectionInput {
  return {
    name: c.name,
    stage: c.stage,
    lastInteractionAt: c.lastInteractionAt,
    interactionFreq: c.interactionFreq,
    initiative: c.initiative,
    emotionQuality: c.emotionQuality,
    investmentBalance: c.investmentBalance,
    offlineStatus: c.offlineStatus,
    upgradeSignals: c.upgradeSignals,
    overrideAction: c.overrideAction,
    overrideReason: c.overrideReason,
    actionDueAt: c.actionDueAt,
    notes: c.notes,
    advisor: c.advisor,
    channelId: c.channelId
  };
}

export function RecordDetailPanel({ mode, connection, onSave, onClose, onDelete }: Props) {
  const { t } = useTranslation();
  const { channels } = useChannels();
  const isNew = mode === "new";
  const [draft, setDraft] = useState<ConnectionInput>(() =>
    connection ? toInput(connection) : buildDefaultConnectionInput()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const recordKey = isNew ? "__new__" : connection?.id ?? null;

  useEffect(() => {
    setDraft(connection ? toInput(connection) : buildDefaultConnectionInput());
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordKey]);

  useEffect(() => {
    if (mode === "closed") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, onClose]);

  const dirty = useMemo(() => {
    if (isNew) return true;
    if (!connection) return false;
    const current = toInput(connection);
    return JSON.stringify(current) !== JSON.stringify(draft);
  }, [draft, connection, isNew]);

  if (mode === "closed") return null;

  const daysSinceInteraction = connection?.lastInteractionAt
    ? Math.round((Date.now() - new Date(connection.lastInteractionAt).getTime()) / 86400000)
    : null;
  const daysUntilDue = connection?.actionDueAt
    ? Math.round((new Date(connection.actionDueAt).getTime() - Date.now()) / 86400000)
    : null;

  const effectiveNextAction: NextAction =
    draft.overrideAction ?? connection?.suggestedAction ?? "KEEP_CHAT";

  const nextActionOpts: ChipOption<NextAction>[] = nextActionOptions.map((a) => ({
    value: a,
    label: t(`NextAction.${a}`),
    color: nextActionColor[a],
    recommendedTag:
      !isNew && connection && a === connection.suggestedAction
        ? `★ ${t(`Advisor.${connection.advisor}`)} ${t("recommended")}`
        : undefined
  }));

  function update<K extends keyof ConnectionInput>(key: K, value: ConnectionInput[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setError(t("fields.stageName") + " ?");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(draft, connection?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!connection || !onDelete) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    try {
      await onDelete(connection.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <div style={styles.scrim} onClick={onClose} />
      <aside style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <header style={styles.header}>
          <input
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            style={styles.nameInput}
            placeholder={t("fields.stageName") as string}
            autoFocus={isNew}
          />
          <button onClick={onClose} style={styles.closeBtn} aria-label="close">×</button>
        </header>

        <div style={styles.body}>
          <Row label={t("stage")}>
            <EditableChipCell<Stage>
              value={draft.stage}
              options={stageOptions.map((s) => ({ value: s, label: t(`Stage.${s}`), color: stageColor[s] }))}
              onChange={(v) => update("stage", v)}
            />
          </Row>

          <Row label={t("lastInteraction")}>
            <input
              type="date"
              value={draft.lastInteractionAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                update("lastInteractionAt", e.target.value ? new Date(e.target.value).toISOString() : null)
              }
              style={styles.dateInput}
            />
          </Row>

          <Row label={t("fields.interactionFreq")}>
            <EditableChipCell<InteractionFrequency>
              value={draft.interactionFreq}
              options={freqOptions.map((f) => ({ value: f, label: t(`InteractionFrequency.${f}`), color: interactionFreqColor[f] }))}
              onChange={(v) => update("interactionFreq", v)}
            />
          </Row>

          <Row label={t("fields.initiative")}>
            <EditableChipCell<InitiativeDirection>
              value={draft.initiative}
              options={initiativeOptions.map((i) => ({ value: i, label: t(`InitiativeDirection.${i}`), color: initiativeColor[i] }))}
              onChange={(v) => update("initiative", v)}
            />
          </Row>

          <Row label={t("fields.emotionQuality")}>
            <EditableChipCell<EmotionQuality>
              value={draft.emotionQuality}
              options={emotionOptions.map((e) => ({ value: e, label: t(`EmotionQuality.${e}`), color: emotionColor[e] }))}
              onChange={(v) => update("emotionQuality", v)}
            />
          </Row>

          <Row label={t("fields.investmentBalance")}>
            <EditableChipCell<InvestmentBalance>
              value={draft.investmentBalance}
              options={investmentOptions.map((i) => ({ value: i, label: t(`InvestmentBalance.${i}`), color: investmentColor[i] }))}
              onChange={(v) => update("investmentBalance", v)}
            />
          </Row>

          <Row label={t("fields.channel")}>
            <EditableChipCell<string>
              value={draft.channelId ?? ""}
              options={channels.map((ch) => ({
                value: ch.id,
                label: ch.name,
                color: ch.color as AirtableColor
              }))}
              onChange={(v) => update("channelId", v || null)}
              onClear={draft.channelId ? () => update("channelId", null) : undefined}
              fallbackLabel="—"
            />
          </Row>

          <Row label={t("fields.offlineStatus")}>
            <EditableChipCell<OfflineStatus>
              value={draft.offlineStatus}
              options={offlineOptions.map((o) => ({ value: o, label: t(`OfflineStatus.${o}`), color: offlineColor[o] }))}
              onChange={(v) => update("offlineStatus", v)}
            />
          </Row>

          <Row label={t("fields.upgradeSignals")}>
            <EditableMultiChipCell<UpgradeSignal>
              values={draft.upgradeSignals}
              options={upgradeOptions.map((u) => ({ value: u, label: t(`UpgradeSignal.${u}`), color: upgradeSignalColor[u] }))}
              onChange={(v) => update("upgradeSignals", v)}
              emptyChip={{ label: t("noSignals"), color: "orangeLight2" }}
            />
          </Row>

          <Row label={t("nextAction")}>
            <EditableChipCell<NextAction>
              value={effectiveNextAction}
              options={nextActionOpts}
              onChange={(v) =>
                update("overrideAction", !isNew && connection && v === connection.suggestedAction ? null : v)
              }
              onClear={
                !isNew && draft.overrideAction != null ? () => update("overrideAction", null) : undefined
              }
              clearLabel={t("clearOverride")}
            />
          </Row>

          <Row label={t("actionDueAtLabel")}>
            <input
              type="date"
              value={draft.actionDueAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                update("actionDueAt", e.target.value ? new Date(e.target.value).toISOString() : null)
              }
              style={styles.dateInput}
            />
          </Row>

          <Row label={t("notesLabel")} align="start">
            <textarea
              value={draft.notes ?? ""}
              onChange={(e) => update("notes", e.target.value || null)}
              placeholder="—"
              style={styles.textarea}
              rows={3}
            />
          </Row>

          {!isNew && connection && (
            <>
              <div style={styles.divider} />

              <Row label={t("daysSinceInteraction")}>
                <span style={styles.plain}>{daysSinceInteraction ?? "—"}</span>
              </Row>

              <Row label={t("daysUntilDue")}>
                <span style={{ ...styles.plain, color: daysUntilDue !== null && daysUntilDue < 0 ? "#ff9090" : "#cfe1f2" }}>
                  {daysUntilDue ?? "—"}
                </span>
              </Row>

              <Row label={t("priority")}>
                <div style={styles.inline}>
                  <Chip label={t(`Priority.${connection.priorityAdvice}`)} color={priorityColor[connection.priorityAdvice]} />
                  <span style={styles.muted}>{t("score")}: {connection.priorityScore}</span>
                </div>
              </Row>

              <Row label={t("advisorMode")}>
                <Chip label={t(`Advisor.${connection.advisor}`)} color={connection.advisor === "AI" ? "greenLight2" : "blueLight2"} />
              </Row>

              {connection.advisorReason && (
                <Row label={t("advisorReason")} align="start">
                  <div style={styles.advisorReason}>{connection.advisorReason}</div>
                </Row>
              )}
            </>
          )}
        </div>

        {error && <div style={styles.errorBar}>{error}</div>}

        <footer style={styles.footer}>
          {!isNew && connection && onDelete ? (
            <button
              onClick={handleDelete}
              style={{ ...styles.deleteBtn, ...(confirmingDelete ? styles.deleteBtnConfirm : null) }}
            >
              {confirmingDelete ? t("confirmDelete") : t("delete")}
            </button>
          ) : <span />}
          <div style={styles.footerRight}>
            <button onClick={onClose} style={styles.cancelBtn} disabled={saving}>
              {t("cancel")}
            </button>
            <button onClick={handleSave} style={styles.saveBtn} disabled={saving || (!isNew && !dirty)}>
              {saving ? "…" : t("save")}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}

function Row({ label, children, align }: { label: string; children: React.ReactNode; align?: "start" | "center" }) {
  return (
    <div style={{ ...styles.row, alignItems: align === "start" ? "flex-start" : "center" }}>
      <div style={styles.rowLabel}>{label}</div>
      <div style={styles.rowValue}>{children}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  scrim: {
    position: "fixed",
    inset: 0,
    background: "rgba(3, 12, 24, 0.45)",
    zIndex: 40
  },
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(640px, 90vw)",
    background: "#0b1d30",
    borderLeft: "1px solid #1f3b58",
    boxShadow: "-16px 0 40px rgba(0,0,0,0.45)",
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    color: "#e3edf5"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    borderBottom: "1px solid #1f3b58"
  },
  nameInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#e3edf5",
    fontSize: 18,
    fontWeight: 600,
    outline: "none",
    padding: "4px 2px"
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#7a9cc6",
    fontSize: 22,
    cursor: "pointer",
    padding: "0 6px",
    lineHeight: 1
  },
  body: {
    flex: 1,
    overflow: "auto",
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  row: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid #132a43"
  },
  rowLabel: { color: "#7a9cc6", fontSize: 13, paddingTop: 4 },
  rowValue: { minWidth: 0 },
  dateInput: {
    background: "#142940",
    color: "#cfe1f2",
    border: "1px solid #1f3b58",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    colorScheme: "dark"
  },
  textarea: {
    width: "100%",
    background: "#142940",
    color: "#cfe1f2",
    border: "1px solid #1f3b58",
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none"
  },
  plain: { color: "#cfe1f2", fontSize: 13 },
  muted: { color: "#7a9cc6", fontSize: 12 },
  inline: { display: "flex", alignItems: "center", gap: 8 },
  divider: { height: 1, background: "#1f3b58", margin: "8px 0" },
  advisorReason: {
    color: "#7cc48a",
    fontSize: 12,
    lineHeight: 1.5,
    fontStyle: "italic",
    borderLeft: "2px solid #26603a",
    paddingLeft: 8
  },
  errorBar: {
    background: "#3a1a1a",
    color: "#ff9090",
    padding: "8px 16px",
    fontSize: 13,
    borderTop: "1px solid #5a2a2a"
  },
  footer: {
    padding: "12px 16px",
    borderTop: "1px solid #1f3b58",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  footerRight: { display: "flex", gap: 8 },
  deleteBtn: {
    background: "transparent",
    border: "1px solid #5a2a2a",
    color: "#ff9090",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13
  },
  deleteBtnConfirm: {
    background: "#5a2a2a",
    color: "#fff",
    border: "1px solid #ff9090"
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid #2c4f70",
    color: "#cfe1f2",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13
  },
  saveBtn: {
    background: "#4b6cb7",
    border: "none",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600
  }
};
