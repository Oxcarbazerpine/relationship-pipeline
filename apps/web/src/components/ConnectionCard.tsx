import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Connection, NextAction } from "../types";
import { actionTone, nextActions } from "../enums";

interface Props {
  connection: Connection;
  onOverride: (id: string, action: NextAction | null, reason?: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ConnectionCard({ connection, onOverride, onDelete }: Props) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draftAction, setDraftAction] = useState<NextAction>(connection.overrideAction ?? connection.suggestedAction);
  const [draftReason, setDraftReason] = useState(connection.overrideReason ?? "");

  const suggestedLabel = t(`NextAction.${connection.suggestedAction}`);
  const suggestedReason = t(`Reason.${connection.suggestedReason}`, { defaultValue: connection.suggestedReason });
  const currentLabel = t(`NextAction.${connection.nextAction}`);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={{ margin: 0 }}>{connection.name}</h3>
          <div style={styles.metaRow}>
            <span style={styles.chip}>{t(`Stage.${connection.stage}`)}</span>
            <span style={styles.chip}>{t(`InteractionFrequency.${connection.interactionFreq}`)}</span>
            <span style={styles.chip}>{t(`EmotionQuality.${connection.emotionQuality}`)}</span>
          </div>
        </div>
        <button onClick={() => onDelete(connection.id)} style={styles.deleteBtn}>
          {t("delete")}
        </button>
      </div>

      <div style={{ ...styles.actionBanner, background: actionTone[connection.nextAction] }}>
        <div style={styles.actionLabel}>{t("nextAction")}</div>
        <div style={styles.actionValue}>{currentLabel}</div>
      </div>

      <div style={styles.suggestionRow}>
        <div>
          <div style={styles.suggestionLabel}>{t("engineSuggests")}</div>
          <div>
            <strong style={{ color: actionTone[connection.suggestedAction] }}>{suggestedLabel}</strong>
            <span style={styles.reasonText}> · {suggestedReason}</span>
          </div>
        </div>
        {connection.isOverridden ? (
          <div style={styles.overrideBadge}>
            <span>{t("youOverrode")}</span>
            <button
              onClick={() => onOverride(connection.id, null)}
              style={styles.acceptBtn}
            >
              {t("acceptSuggestion")}
            </button>
          </div>
        ) : (
          !editing && (
            <button onClick={() => setEditing(true)} style={styles.overrideBtn}>
              {t("override")}
            </button>
          )
        )}
      </div>

      {connection.isOverridden && connection.overrideReason && (
        <div style={styles.overrideReasonText}>{connection.overrideReason}</div>
      )}

      {editing && (
        <div style={styles.editor}>
          <select value={draftAction} onChange={(e) => setDraftAction(e.target.value as NextAction)} style={styles.select}>
            {nextActions.map((a) => (
              <option key={a} value={a}>
                {t(`NextAction.${a}`)}
              </option>
            ))}
          </select>
          <input
            value={draftReason}
            onChange={(e) => setDraftReason(e.target.value)}
            placeholder={t("overrideReason")}
            style={styles.input}
          />
          <button
            onClick={async () => {
              await onOverride(connection.id, draftAction, draftReason || null);
              setEditing(false);
            }}
            style={styles.saveBtn}
          >
            {t("save")}
          </button>
          <button onClick={() => setEditing(false)} style={styles.cancelBtn}>
            {t("cancel")}
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid #e3e3e8",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "#fff"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  metaRow: { display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" },
  chip: {
    background: "#f1f3f8",
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: 12,
    color: "#444"
  },
  actionBanner: {
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  actionLabel: { fontSize: 12, opacity: 0.85, textTransform: "uppercase", letterSpacing: 0.5 },
  actionValue: { fontSize: 18, fontWeight: 600 },
  suggestionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 4
  },
  suggestionLabel: { fontSize: 12, color: "#888" },
  reasonText: { color: "#666", fontSize: 13 },
  overrideBadge: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    color: "#c62828",
    fontSize: 13
  },
  overrideReasonText: {
    background: "#fff6f6",
    borderLeft: "3px solid #c62828",
    padding: "6px 10px",
    fontSize: 13,
    color: "#733"
  },
  overrideBtn: {
    background: "none",
    border: "1px solid #bbb",
    padding: "4px 10px",
    borderRadius: 6,
    cursor: "pointer"
  },
  acceptBtn: {
    background: "#2e7d32",
    color: "#fff",
    border: "none",
    padding: "4px 10px",
    borderRadius: 6,
    cursor: "pointer"
  },
  editor: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    paddingTop: 6,
    borderTop: "1px dashed #ddd"
  },
  select: { padding: 6 },
  input: { flex: 1, minWidth: 180, padding: 6 },
  saveBtn: {
    background: "#4b6cb7",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
  },
  cancelBtn: {
    background: "none",
    border: "1px solid #bbb",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#c62828",
    cursor: "pointer",
    fontSize: 13
  }
};
