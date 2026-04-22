import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import {
  emotionQualities,
  initiatives,
  interactionFreqs,
  investmentBalances,
  offlineStatuses,
  stages,
  upgradeSignals as upgradeSignalOptions,
  actionTone
} from "../enums";
import type {
  AdvisorKind,
  ConnectionInput,
  DecisionResult,
  EmotionQuality,
  InitiativeDirection,
  InteractionFrequency,
  InvestmentBalance,
  OfflineStatus,
  Stage,
  UpgradeSignal
} from "../types";

interface Props {
  onCreated: () => void;
}

const initial: ConnectionInput = {
  name: "",
  stage: "INTRO",
  interactionFreq: "MEDIUM",
  initiative: "BALANCED",
  emotionQuality: "NEUTRAL",
  investmentBalance: "BALANCED",
  offlineStatus: "NEVER",
  upgradeSignals: [],
  advisor: "RULES"
};

export function NewConnectionForm({ onCreated }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ConnectionInput>(initial);
  const [preview, setPreview] = useState<DecisionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  const setAdvisor = async (kind: AdvisorKind) => {
    setAdvisorError(null);
    if (kind === "AI") {
      const result = await api.testAdvisor("AI");
      if (!result.ok) {
        setAdvisorError(result.error ?? t("aiUnavailable"));
        return;
      }
    }
    setForm((f) => ({ ...f, advisor: kind }));
  };

  useEffect(() => {
    let cancelled = false;
    api
      .decide({
        stage: form.stage,
        interactionFreq: form.interactionFreq,
        initiative: form.initiative,
        emotionQuality: form.emotionQuality,
        investmentBalance: form.investmentBalance,
        offlineStatus: form.offlineStatus,
        upgradeSignals: form.upgradeSignals
      })
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [
    form.stage,
    form.interactionFreq,
    form.initiative,
    form.emotionQuality,
    form.investmentBalance,
    form.offlineStatus,
    form.upgradeSignals
  ]);

  const toggleSignal = (s: UpgradeSignal) => {
    setForm((f) => ({
      ...f,
      upgradeSignals: f.upgradeSignals.includes(s)
        ? f.upgradeSignals.filter((x) => x !== s)
        : [...f.upgradeSignals, s]
    }));
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await api.createConnection(form);
      setForm(initial);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={{ marginTop: 0 }}>{t("newConnection")}</h3>

      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder={t("name")}
        style={styles.nameInput}
      />

      <div style={styles.grid}>
        <Field label={t("stage")}>
          <Select value={form.stage} options={stages} labelFor={(v) => t(`Stage.${v}`)} onChange={(v) => setForm({ ...form, stage: v as Stage })} />
        </Field>
        <Field label={t("fields.interactionFreq")}>
          <Select
            value={form.interactionFreq}
            options={interactionFreqs}
            labelFor={(v) => t(`InteractionFrequency.${v}`)}
            onChange={(v) => setForm({ ...form, interactionFreq: v as InteractionFrequency })}
          />
        </Field>
        <Field label={t("fields.initiative")}>
          <Select
            value={form.initiative}
            options={initiatives}
            labelFor={(v) => t(`InitiativeDirection.${v}`)}
            onChange={(v) => setForm({ ...form, initiative: v as InitiativeDirection })}
          />
        </Field>
        <Field label={t("fields.emotionQuality")}>
          <Select
            value={form.emotionQuality}
            options={emotionQualities}
            labelFor={(v) => t(`EmotionQuality.${v}`)}
            onChange={(v) => setForm({ ...form, emotionQuality: v as EmotionQuality })}
          />
        </Field>
        <Field label={t("fields.investmentBalance")}>
          <Select
            value={form.investmentBalance}
            options={investmentBalances}
            labelFor={(v) => t(`InvestmentBalance.${v}`)}
            onChange={(v) => setForm({ ...form, investmentBalance: v as InvestmentBalance })}
          />
        </Field>
        <Field label={t("fields.offlineStatus")}>
          <Select
            value={form.offlineStatus}
            options={offlineStatuses}
            labelFor={(v) => t(`OfflineStatus.${v}`)}
            onChange={(v) => setForm({ ...form, offlineStatus: v as OfflineStatus })}
          />
        </Field>
      </div>

      <div style={styles.signalsRow}>
        <div style={styles.fieldLabel}>{t("fields.upgradeSignals")}</div>
        <div style={styles.signalChips}>
          {upgradeSignalOptions.map((s) => {
            const active = form.upgradeSignals.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSignal(s)}
                style={{
                  ...styles.signalChip,
                  background: active ? "#4b6cb7" : "#f1f3f8",
                  color: active ? "#fff" : "#333",
                  borderColor: active ? "#4b6cb7" : "#ddd"
                }}
              >
                {t(`UpgradeSignal.${s}`)}
              </button>
            );
          })}
        </div>
      </div>

      {preview && (
        <div style={styles.previewBox}>
          <span style={styles.previewLabel}>{t("preview")}:</span>
          <strong style={{ color: actionTone[preview.nextAction], marginLeft: 8 }}>
            {t(`NextAction.${preview.nextAction}`)}
          </strong>
          <span style={styles.previewReason}>
            · {t(`Reason.${preview.reasonCode}`, { defaultValue: preview.reasonCode })}
          </span>
        </div>
      )}

      <div style={styles.advisorRow}>
        <span style={styles.fieldLabel}>{t("advisorMode")}:</span>
        <button
          type="button"
          onClick={() => setAdvisor("RULES")}
          style={{ ...styles.advisorBtn, ...(form.advisor === "RULES" ? styles.advisorBtnActive : {}) }}
        >
          {t("Advisor.RULES")}
        </button>
        <button
          type="button"
          onClick={() => setAdvisor("AI")}
          style={{ ...styles.advisorBtn, ...(form.advisor === "AI" ? styles.advisorBtnActive : {}) }}
        >
          {t("Advisor.AI")}
        </button>
      </div>
      {advisorError && (
        <div style={styles.advisorError}>
          {t("aiUnavailable")}: {advisorError}
        </div>
      )}

      <button onClick={submit} disabled={submitting || !form.name.trim()} style={styles.submitBtn}>
        {t("add")}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={styles.fieldLabel}>{label}</div>
      {children}
    </div>
  );
}

function Select<T extends string>({
  value,
  options,
  labelFor,
  onChange
}: {
  value: T;
  options: readonly T[];
  labelFor: (v: T) => string;
  onChange: (v: T) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} style={styles.select}>
      {options.map((o) => (
        <option key={o} value={o}>
          {labelFor(o)}
        </option>
      ))}
    </select>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid #e3e3e8",
    borderRadius: 12,
    padding: 16,
    background: "#fafbff",
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  nameInput: { padding: 8, fontSize: 16, border: "1px solid #ccc", borderRadius: 6 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10
  },
  fieldLabel: { fontSize: 12, color: "#666", marginBottom: 4 },
  select: { padding: 6, width: "100%" },
  signalsRow: { display: "flex", flexDirection: "column", gap: 6 },
  signalChips: { display: "flex", gap: 6, flexWrap: "wrap" },
  signalChip: {
    padding: "4px 12px",
    borderRadius: 999,
    border: "1px solid",
    cursor: "pointer",
    fontSize: 13
  },
  previewBox: {
    background: "#fff",
    border: "1px dashed #bcd",
    padding: "8px 12px",
    borderRadius: 8
  },
  previewLabel: { fontSize: 12, color: "#666" },
  previewReason: { color: "#666", fontSize: 13 },
  submitBtn: {
    padding: "8px 16px",
    background: "#4b6cb7",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    alignSelf: "flex-start"
  },
  advisorRow: { display: "flex", gap: 8, alignItems: "center" },
  advisorBtn: {
    background: "transparent",
    border: "1px solid #2c4f70",
    color: "#cfe1f2",
    padding: "4px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13
  },
  advisorBtnActive: { background: "#4b6cb7", borderColor: "#4b6cb7", color: "#fff" },
  advisorError: {
    background: "#3a1a1a",
    color: "#ff9090",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 13,
    border: "1px solid #5a2a2a"
  }
};
