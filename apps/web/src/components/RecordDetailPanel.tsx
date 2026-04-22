import { useEffect, useState } from "react";
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

interface Props {
  connection: Connection | null;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<ConnectionInput>) => Promise<void>;
  onSetOverride: (id: string, action: NextAction | null) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function RecordDetailPanel({ connection, onClose, onPatch, onSetOverride, onDelete }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setName(connection?.name ?? "");
    setNotes(connection?.notes ?? "");
  }, [connection?.id, connection?.name, connection?.notes]);

  useEffect(() => {
    if (!connection) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [connection, onClose]);

  if (!connection) return null;
  const c = connection;

  const daysSinceInteraction = c.lastInteractionAt
    ? Math.round((Date.now() - new Date(c.lastInteractionAt).getTime()) / 86400000)
    : null;
  const daysUntilDue = c.actionDueAt
    ? Math.round((new Date(c.actionDueAt).getTime() - Date.now()) / 86400000)
    : null;

  const nextActionOpts: ChipOption<NextAction>[] = nextActionOptions.map((a) => ({
    value: a,
    label: t(`NextAction.${a}`),
    color: nextActionColor[a],
    recommendedTag: a === c.suggestedAction ? `★ ${t(`Advisor.${c.advisor}`)} ${t("recommended")}` : undefined
  }));

  async function saveName() {
    if (name !== c.name && name.trim()) await onPatch(c.id, { name: name.trim() });
    else setName(c.name);
  }
  async function saveNotes() {
    if (notes !== (c.notes ?? "")) await onPatch(c.id, { notes: notes || null });
  }

  return (
    <>
      <div style={styles.scrim} onClick={onClose} />
      <aside style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <header style={styles.header}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            style={styles.nameInput}
            placeholder={t("fields.stageName") as string}
          />
          <button onClick={onClose} style={styles.closeBtn} aria-label="close">×</button>
        </header>

        <div style={styles.body}>
          <Row label={t("stage")}>
            <EditableChipCell<Stage>
              value={c.stage}
              options={stageOptions.map((s) => ({ value: s, label: t(`Stage.${s}`), color: stageColor[s] }))}
              onChange={(v) => onPatch(c.id, { stage: v })}
            />
          </Row>

          <Row label={t("lastInteraction")}>
            <input
              type="date"
              value={c.lastInteractionAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                onPatch(c.id, {
                  lastInteractionAt: e.target.value ? new Date(e.target.value).toISOString() : null
                })
              }
              style={styles.dateInput}
            />
          </Row>

          <Row label={t("fields.interactionFreq")}>
            <EditableChipCell<InteractionFrequency>
              value={c.interactionFreq}
              options={freqOptions.map((f) => ({ value: f, label: t(`InteractionFrequency.${f}`), color: interactionFreqColor[f] }))}
              onChange={(v) => onPatch(c.id, { interactionFreq: v })}
            />
          </Row>

          <Row label={t("fields.initiative")}>
            <EditableChipCell<InitiativeDirection>
              value={c.initiative}
              options={initiativeOptions.map((i) => ({ value: i, label: t(`InitiativeDirection.${i}`), color: initiativeColor[i] }))}
              onChange={(v) => onPatch(c.id, { initiative: v })}
            />
          </Row>

          <Row label={t("fields.emotionQuality")}>
            <EditableChipCell<EmotionQuality>
              value={c.emotionQuality}
              options={emotionOptions.map((e) => ({ value: e, label: t(`EmotionQuality.${e}`), color: emotionColor[e] }))}
              onChange={(v) => onPatch(c.id, { emotionQuality: v })}
            />
          </Row>

          <Row label={t("fields.investmentBalance")}>
            <EditableChipCell<InvestmentBalance>
              value={c.investmentBalance}
              options={investmentOptions.map((i) => ({ value: i, label: t(`InvestmentBalance.${i}`), color: investmentColor[i] }))}
              onChange={(v) => onPatch(c.id, { investmentBalance: v })}
            />
          </Row>

          <Row label={t("fields.offlineStatus")}>
            <EditableChipCell<OfflineStatus>
              value={c.offlineStatus}
              options={offlineOptions.map((o) => ({ value: o, label: t(`OfflineStatus.${o}`), color: offlineColor[o] }))}
              onChange={(v) => onPatch(c.id, { offlineStatus: v })}
            />
          </Row>

          <Row label={t("fields.upgradeSignals")}>
            <EditableMultiChipCell<UpgradeSignal>
              values={c.upgradeSignals}
              options={upgradeOptions.map((u) => ({ value: u, label: t(`UpgradeSignal.${u}`), color: upgradeSignalColor[u] }))}
              onChange={(v) => onPatch(c.id, { upgradeSignals: v })}
              emptyChip={{ label: t("noSignals"), color: "orangeLight2" }}
            />
          </Row>

          <Row label={t("nextAction")}>
            <EditableChipCell<NextAction>
              value={c.nextAction}
              options={nextActionOpts}
              onChange={(v) => onSetOverride(c.id, v === c.suggestedAction ? null : v)}
              onClear={c.isOverridden ? () => onSetOverride(c.id, null) : undefined}
              clearLabel={t("clearOverride")}
            />
          </Row>

          <Row label={t("actionDueAtLabel")}>
            <input
              type="date"
              value={c.actionDueAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                onPatch(c.id, {
                  actionDueAt: e.target.value ? new Date(e.target.value).toISOString() : null
                })
              }
              style={styles.dateInput}
            />
          </Row>

          <Row label={t("notesLabel")} align="start">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="—"
              style={styles.textarea}
              rows={3}
            />
          </Row>

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
              <Chip label={t(`Priority.${c.priorityAdvice}`)} color={priorityColor[c.priorityAdvice]} />
              <span style={styles.muted}>{t("score")}: {c.priorityScore}</span>
            </div>
          </Row>

          <Row label={t("advisorMode")}>
            <Chip label={t(`Advisor.${c.advisor}`)} color={c.advisor === "AI" ? "greenLight2" : "blueLight2"} />
          </Row>

          {c.advisorReason && (
            <Row label={t("advisorReason")} align="start">
              <div style={styles.advisorReason}>{c.advisorReason}</div>
            </Row>
          )}
        </div>

        {onDelete && (
          <footer style={styles.footer}>
            <button
              onClick={() => {
                if (confirm(t("confirmDelete") as string)) onDelete(c.id);
              }}
              style={styles.deleteBtn}
            >
              {t("delete")}
            </button>
          </footer>
        )}
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
    zIndex: 40,
    animation: "fadein 120ms ease"
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
  footer: {
    padding: "12px 16px",
    borderTop: "1px solid #1f3b58",
    display: "flex",
    justifyContent: "flex-end"
  },
  deleteBtn: {
    background: "transparent",
    border: "1px solid #5a2a2a",
    color: "#ff9090",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13
  }
};
