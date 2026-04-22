import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import type { Connection, InteractionFrequency, NextAction, Stage } from "../types";
import { Chip } from "../components/Chip";
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

const stageOrder: Stage[] = ["INTRO", "COMFORT", "FLIRT", "UPGRADE", "COOLING", "ENDED"];

export function StageKanban() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [actionFilter, setActionFilter] = useState<NextAction | "">("");
  const [freqFilter, setFreqFilter] = useState<InteractionFrequency | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listConnections().then((list) => {
      setConnections(list);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return connections.filter((c) => {
      if (actionFilter && c.nextAction !== actionFilter) return false;
      if (freqFilter && c.interactionFreq !== freqFilter) return false;
      return true;
    });
  }, [connections, actionFilter, freqFilter]);

  const byStage = useMemo(() => {
    const map = new Map<Stage, Connection[]>();
    for (const s of stageOrder) map.set(s, []);
    for (const c of filtered) map.get(c.stage)?.push(c);
    return map;
  }, [filtered]);

  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>
        <span style={{ color: "#7a9cc6" }}>Pipeline</span>
        <span style={{ color: "#546e87" }}> › </span>
        <span>{t("nav.pipelineKanban")}</span>
      </div>

      <div style={styles.description}>
        Visualize and manage relationship records by moving them across stages
      </div>

      <div style={styles.filterBar}>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as NextAction | "")}
          style={styles.filterSelect}
        >
          <option value="">{t("nextAction")}</option>
          {(["KEEP_CHAT","LIGHT_UPGRADE","CLEAR_INVITE","SLOW_DOWN","OBSERVE","END"] as NextAction[]).map((a) => (
            <option key={a} value={a}>{t(`NextAction.${a}`)}</option>
          ))}
        </select>
        <select
          value={freqFilter}
          onChange={(e) => setFreqFilter(e.target.value as InteractionFrequency | "")}
          style={styles.filterSelect}
        >
          <option value="">{t("fields.interactionFreq")}</option>
          {(["HIGH","MEDIUM","LOW","NONE"] as InteractionFrequency[]).map((f) => (
            <option key={f} value={f}>{t(`InteractionFrequency.${f}`)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ color: "#7a9cc6" }}>...</div>
      ) : (
        <div style={styles.board}>
          {stageOrder.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <div key={stage} style={styles.column}>
                <div style={styles.columnHeader}>
                  <Chip label={t(`Stage.${stage}`)} color={stageColor[stage]} size="md" />
                  <span style={styles.count}>{items.length}</span>
                </div>
                <div style={styles.cards}>
                  {items.map((c) => (
                    <KanbanCard key={c.id} connection={c} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function KanbanCard({ connection: c }: { connection: Connection }) {
  const { t } = useTranslation();
  const daysUntilDue = c.actionDueAt
    ? Math.round((new Date(c.actionDueAt).getTime() - Date.now()) / 86400000)
    : null;
  return (
    <div style={styles.card}>
      <div style={styles.cardName}>{c.name}</div>

      {c.lastInteractionAt && (
        <Field label={t("lastInteraction")}>
          <span style={styles.plainValue}>{c.lastInteractionAt.slice(0, 10)}</span>
        </Field>
      )}

      <Field label={t("fields.interactionFreq")}>
        <Chip label={t(`InteractionFrequency.${c.interactionFreq}`)} color={interactionFreqColor[c.interactionFreq]} />
      </Field>

      <Field label={t("fields.initiative")}>
        <Chip label={t(`InitiativeDirection.${c.initiative}`)} color={initiativeColor[c.initiative]} />
      </Field>

      <Field label={t("fields.emotionQuality")}>
        <Chip label={t(`EmotionQuality.${c.emotionQuality}`)} color={emotionColor[c.emotionQuality]} />
      </Field>

      <Field label={t("fields.investmentBalance")}>
        <Chip label={t(`InvestmentBalance.${c.investmentBalance}`)} color={investmentColor[c.investmentBalance]} />
      </Field>

      <Field label={t("fields.offlineStatus")}>
        <Chip label={t(`OfflineStatus.${c.offlineStatus}`)} color={offlineColor[c.offlineStatus]} />
      </Field>

      <Field label={t("fields.upgradeSignals")}>
        {c.upgradeSignals.length === 0 ? (
          <Chip label={t("noSignals")} color="orangeLight2" />
        ) : (
          <div style={styles.chipRow}>
            {c.upgradeSignals.map((s) => (
              <Chip key={s} label={t(`UpgradeSignal.${s}`)} color={upgradeSignalColor[s]} />
            ))}
          </div>
        )}
      </Field>

      <Field label={t("nextAction")}>
        <Chip label={t(`NextAction.${c.nextAction}`)} color={nextActionColor[c.nextAction]} size="md" />
      </Field>

      {c.actionDueAt && (
        <Field label={t("actionDueAtLabel")}>
          <span style={styles.plainValue}>{c.actionDueAt.slice(0, 10)}</span>
          {daysUntilDue !== null && (
            <span style={{ marginLeft: 8, color: daysUntilDue < 0 ? "#ff7070" : "#7a9cc6", fontSize: 12 }}>
              {daysUntilDue < 0
                ? t("daysOverdue", { days: -daysUntilDue })
                : t("daysRemaining", { days: daysUntilDue })}
            </span>
          )}
        </Field>
      )}

      <Field label={t("priority")}>
        <Chip label={t(`Priority.${c.priorityAdvice}`)} color={priorityColor[c.priorityAdvice]} />
        <span style={{ marginLeft: 8, color: "#7a9cc6", fontSize: 12 }}>
          {t("score")}: {c.priorityScore}
        </span>
      </Field>

      <Field label={t("advisorMode")}>
        <Chip
          label={t(`Advisor.${c.advisor}`)}
          color={c.advisor === "AI" ? "greenLight2" : "blueLight2"}
        />
      </Field>

      {c.notes && (
        <Field label={t("notesLabel")}>
          <div style={styles.notes}>{c.notes}</div>
        </Field>
      )}

      {c.advisorReason && (
        <div style={styles.advisorReason}>{c.advisorReason}</div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldLabel}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    flex: 1,
    padding: 24,
    color: "#e3edf5",
    overflow: "auto"
  },
  breadcrumb: { fontSize: 14, marginBottom: 4 },
  description: { fontSize: 13, color: "#7a9cc6", marginBottom: 16 },
  filterBar: { display: "flex", gap: 8, marginBottom: 16 },
  filterSelect: {
    background: "#1a3550",
    color: "#cfe1f2",
    border: "1px solid #2c4f70",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 13
  },
  board: { display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16 },
  column: { minWidth: 260, display: "flex", flexDirection: "column", gap: 8 },
  columnHeader: { display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 },
  count: { color: "#7a9cc6", fontSize: 14 },
  cards: { display: "flex", flexDirection: "column", gap: 10 },
  card: {
    background: "#142940",
    border: "1px solid #1f3b58",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  cardName: { fontWeight: 600, fontSize: 17, marginBottom: 2 },
  field: { display: "flex", flexDirection: "column", gap: 3 },
  fieldLabel: { fontSize: 11, color: "#7a9cc6" },
  plainValue: { color: "#cfe1f2", fontSize: 13 },
  chipRow: { display: "flex", gap: 4, flexWrap: "wrap" },
  notes: { color: "#cfe1f2", fontSize: 13, lineHeight: 1.5 },
  advisorReason: {
    fontSize: 12,
    color: "#7cc48a",
    fontStyle: "italic",
    borderLeft: "2px solid #26603a",
    paddingLeft: 8
  }
};
