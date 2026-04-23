import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useChannels } from "../ChannelsContext";
import { Chip } from "../components/Chip";
import { airtableChip, type AirtableColor } from "../airtableColors";

const palette: AirtableColor[] = [
  "blueLight2",
  "cyanLight2",
  "tealLight2",
  "greenLight2",
  "yellowLight2",
  "orangeLight2"
];

export function ChannelsSettings() {
  const { t } = useTranslation();
  const { channels, create, update, remove } = useChannels();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<AirtableColor>("blueLight2");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newName.trim()) return;
    setError(null);
    try {
      await create({ name: newName.trim(), color: newColor });
      setNewName("");
      setNewColor("blueLight2");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      setTimeout(() => setConfirmingDeleteId((x) => (x === id ? null : x)), 3000);
      return;
    }
    setConfirmingDeleteId(null);
    try {
      await remove(id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>
        <span style={{ color: "#7a9cc6" }}>{t("nav.settings")}</span>
        <span style={{ color: "#546e87" }}> › </span>
        <span>{t("nav.channels")}</span>
      </div>
      <h2 style={styles.title}>{t("channel.pageTitle")}</h2>
      <p style={styles.desc}>{t("channel.pageDesc")}</p>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.list}>
        {channels.length === 0 && <div style={styles.empty}>{t("channel.empty")}</div>}
        {channels.map((ch) => (
          <div key={ch.id} style={styles.row}>
            <div style={styles.preview}>
              <Chip label={ch.name || "—"} color={(ch.color as AirtableColor) ?? "blueLight2"} size="md" />
            </div>
            <input
              value={ch.name}
              onChange={(e) => update(ch.id, { name: e.target.value }).catch((err) => setError((err as Error).message))}
              style={styles.nameInput}
            />
            <ColorPicker
              value={ch.color as AirtableColor}
              onChange={(c) => update(ch.id, { color: c }).catch((err) => setError((err as Error).message))}
            />
            <button
              onClick={() => handleDelete(ch.id)}
              style={{ ...styles.deleteBtn, ...(confirmingDeleteId === ch.id ? styles.deleteBtnConfirm : null) }}
            >
              {confirmingDeleteId === ch.id ? t("confirmDelete") : t("delete")}
            </button>
          </div>
        ))}
      </div>

      <div style={styles.addRow}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder={t("channel.addPlaceholder") as string}
          style={styles.nameInput}
        />
        <ColorPicker value={newColor} onChange={setNewColor} />
        <button onClick={handleAdd} style={styles.addBtn} disabled={!newName.trim()}>
          {t("channel.addBtn")}
        </button>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: AirtableColor; onChange: (c: AirtableColor) => void }) {
  return (
    <div style={styles.palette}>
      {palette.map((c) => {
        const tone = airtableChip[c];
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              cursor: "pointer",
              background: tone.bg,
              border: value === c ? `2px solid ${tone.fg}` : `1px solid ${tone.border}`
            }}
            aria-label={c}
          />
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { flex: 1, padding: 24, color: "#e3edf5", overflow: "auto" },
  breadcrumb: { fontSize: 14, marginBottom: 4 },
  title: { margin: "8px 0 4px", fontSize: 22 },
  desc: { color: "#7a9cc6", fontSize: 13, marginTop: 0, marginBottom: 20, maxWidth: 640 },
  error: {
    background: "#3a1a1a",
    color: "#ff9090",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #5a2a2a",
    marginBottom: 12
  },
  list: {
    border: "1px solid #1f3b58",
    borderRadius: 10,
    background: "#0f2136",
    maxWidth: 720,
    overflow: "hidden"
  },
  empty: { padding: 20, textAlign: "center", color: "#7a9cc6" },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderBottom: "1px solid #17304a"
  },
  preview: { minWidth: 100 },
  nameInput: {
    flex: 1,
    background: "#142940",
    color: "#cfe1f2",
    border: "1px solid #1f3b58",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 13,
    outline: "none"
  },
  palette: { display: "flex", gap: 4 },
  deleteBtn: {
    background: "transparent",
    border: "1px solid #5a2a2a",
    color: "#ff9090",
    padding: "5px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    whiteSpace: "nowrap"
  },
  deleteBtnConfirm: { background: "#5a2a2a", color: "#fff", border: "1px solid #ff9090" },
  addRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    maxWidth: 720
  },
  addBtn: {
    background: "#4b6cb7",
    color: "#fff",
    border: "none",
    padding: "7px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13
  }
};
