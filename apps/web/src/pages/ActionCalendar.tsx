import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import type { Connection, NextAction } from "../types";
import { nextActionColor, stageColor, airtableChip } from "../airtableColors";
import { Chip } from "../components/Chip";

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function fmtMonthDay(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(d);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const weekdayKeys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ActionCalendar() {
  const { t, i18n } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [actionFilter, setActionFilter] = useState<NextAction | "">("");
  const [selected, setSelected] = useState<Connection | null>(null);

  useEffect(() => {
    api.listConnections().then((list) => {
      setConnections(list);
      setLoading(false);
    });
  }, []);

  const weekEnd = addDays(weekStart, 6);
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const filtered = useMemo(
    () => connections.filter((c) => !actionFilter || c.nextAction === actionFilter),
    [connections, actionFilter]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<number, Connection[]>();
    for (let i = 0; i < 7; i++) map.set(i, []);
    for (const c of filtered) {
      if (!c.actionDueAt) continue;
      const due = new Date(c.actionDueAt);
      due.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7; i++) {
        if (sameDay(due, addDays(weekStart, i))) {
          map.get(i)!.push(c);
          break;
        }
      }
    }
    return map;
  }, [filtered, weekStart]);

  const overdue = useMemo(
    () => filtered.filter((c) => {
      if (!c.actionDueAt) return false;
      const due = new Date(c.actionDueAt);
      return due < weekStart && c.nextAction !== "END";
    }),
    [filtered, weekStart]
  );

  const rangeLabel = `${fmtMonthDay(weekStart, i18n.language)} – ${fmtMonthDay(weekEnd, i18n.language)}`;

  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>
        <span style={{ color: "#7a9cc6" }}>Action</span>
        <span style={{ color: "#546e87" }}> › </span>
        <span>{t("nav.actionCalendar")}</span>
      </div>
      <div style={styles.description}>
        Visualize and manage upcoming and overdue next actions for each relationship
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
      </div>

      <div style={styles.navStrip}>
        <div style={styles.rangeLabel}>{rangeLabel}</div>
        <div style={styles.navButtons}>
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} style={styles.navBtn}>◄</button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} style={styles.navBtn}>►</button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} style={styles.todayBtn}>{t("today")}</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "#7a9cc6" }}>...</div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div style={styles.overdueStrip}>
              <div style={styles.overdueLabel}>{t("overdueHeader")}</div>
              <div style={styles.overdueList}>
                {overdue.map((c) => (
                  <EventChip key={c.id} connection={c} onClick={() => setSelected(c)} overdue />
                ))}
              </div>
            </div>
          )}

          <div style={styles.grid}>
            {weekdayKeys.map((wk, i) => {
              const day = addDays(weekStart, i);
              const isToday = sameDay(day, today);
              const events = eventsByDay.get(i) ?? [];
              return (
                <div key={wk} style={styles.dayCol}>
                  <div style={{ ...styles.dayHeader, ...(isToday ? styles.dayHeaderToday : {}) }}>
                    <div style={styles.dayName}>{t(`weekday.${wk}`)}</div>
                    <div style={styles.dayNum}>{day.getDate()}</div>
                  </div>
                  <div style={styles.dayBody}>
                    {events.map((c) => (
                      <EventChip key={c.id} connection={c} onClick={() => setSelected(c)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selected && <DetailModal connection={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function EventChip({
  connection: c,
  onClick,
  overdue
}: {
  connection: Connection;
  onClick: () => void;
  overdue?: boolean;
}) {
  const { t } = useTranslation();
  const color = nextActionColor[c.nextAction];
  const tone = airtableChip[color];
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.event,
        background: tone.bg,
        color: tone.fg,
        borderColor: overdue ? "#c62828" : tone.border
      }}
      title={`${c.name} · ${t(`NextAction.${c.nextAction}`)}`}
    >
      <strong style={{ marginRight: 6 }}>{c.name}</strong>
      <span style={{ opacity: 0.85 }}>
        {t(`Stage.${c.stage}`)} · {t(`NextAction.${c.nextAction}`)}
      </span>
    </button>
  );
}

function DetailModal({ connection: c, onClose }: { connection: Connection; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: "#7a9cc6" }}>
              {c.actionDueAt?.slice(0, 10)}
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>
        <div style={styles.modalBody}>
          <Row label={t("stage")}><Chip label={t(`Stage.${c.stage}`)} color={stageColor[c.stage]} /></Row>
          <Row label={t("nextAction")}>
            <Chip label={t(`NextAction.${c.nextAction}`)} color={nextActionColor[c.nextAction]} size="md" />
          </Row>
          {c.notes && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: "#7a9cc6" }}>{t("notesLabel")}</div>
              <div style={{ marginTop: 4, color: "#cfe1f2" }}>{c.notes}</div>
            </div>
          )}
          {c.advisorReason && (
            <div style={{ marginTop: 8, color: "#7cc48a", fontSize: 13, fontStyle: "italic" }}>
              {c.advisorReason}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
      <span style={{ fontSize: 12, color: "#7a9cc6", width: 80 }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { flex: 1, padding: 24, color: "#e3edf5", overflow: "auto", display: "flex", flexDirection: "column", gap: 14 },
  breadcrumb: { fontSize: 14 },
  description: { fontSize: 13, color: "#7a9cc6" },
  filterBar: { display: "flex", gap: 8 },
  filterSelect: {
    background: "#1a3550",
    color: "#cfe1f2",
    border: "1px solid #2c4f70",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 13
  },
  navStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "4px 0"
  },
  rangeLabel: { fontSize: 18, fontWeight: 600 },
  navButtons: { display: "flex", gap: 6 },
  navBtn: {
    background: "#1a3550",
    color: "#cfe1f2",
    border: "1px solid #2c4f70",
    width: 32,
    height: 30,
    borderRadius: 6,
    cursor: "pointer"
  },
  todayBtn: {
    background: "#1a3550",
    color: "#cfe1f2",
    border: "1px solid #2c4f70",
    padding: "0 14px",
    height: 30,
    borderRadius: 6,
    cursor: "pointer"
  },
  overdueStrip: {
    background: "#2a1515",
    border: "1px solid #5a2a2a",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  overdueLabel: { fontSize: 12, color: "#ff9090", fontWeight: 600 },
  overdueList: { display: "flex", gap: 6, flexWrap: "wrap" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 8,
    minHeight: 420
  },
  dayCol: {
    background: "#0f2136",
    border: "1px solid #1f3b58",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  dayHeader: {
    padding: "10px 12px",
    borderBottom: "1px solid #1f3b58",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  dayHeaderToday: { background: "#1a3550", color: "#fff" },
  dayName: { fontSize: 12, color: "#7a9cc6" },
  dayNum: { fontSize: 18, fontWeight: 600 },
  dayBody: { padding: 8, display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  event: {
    textAlign: "left",
    border: "1px solid",
    borderRadius: 6,
    padding: "6px 8px",
    fontSize: 12,
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  modalBackdrop: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  modal: {
    background: "#142940",
    border: "1px solid #1f3b58",
    borderRadius: 10,
    width: 420,
    maxWidth: "90vw"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid #1f3b58"
  },
  modalBody: { padding: 16 },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#7a9cc6",
    fontSize: 24,
    cursor: "pointer",
    lineHeight: 1
  }
};
