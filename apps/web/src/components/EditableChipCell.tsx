import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Chip } from "./Chip";
import type { AirtableColor } from "../airtableColors";

export interface ChipOption<V extends string> {
  value: V;
  label: string;
  color: AirtableColor;
  /** Extra tag rendered after the label in the popover (e.g. "★ AI 推荐") */
  recommendedTag?: string;
}

interface SingleProps<V extends string> {
  value: V;
  options: ChipOption<V>[];
  onChange: (next: V) => void | Promise<void>;
  /** Label used when the current value option is missing */
  fallbackLabel?: string;
  size?: "sm" | "md";
  /** Show a clear button that passes null to onClear */
  onClear?: () => void | Promise<void>;
  clearLabel?: string;
}

export function EditableChipCell<V extends string>({
  value,
  options,
  onChange,
  fallbackLabel,
  size,
  onClear,
  clearLabel
}: SingleProps<V>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function close(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  async function pick(v: V) {
    setOpen(false);
    if (v !== value) await onChange(v);
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }} onClick={stop}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={triggerStyle}
      >
        {current ? (
          <Chip label={current.label} color={current.color} size={size} />
        ) : (
          <span style={fallbackStyle}>{fallbackLabel ?? "—"}</span>
        )}
        <span style={caretStyle}>▾</span>
      </button>
      {open && (
        <div style={popoverStyle}>
          {onClear && (
            <button type="button" style={clearBtnStyle} onClick={async () => { setOpen(false); await onClear(); }}>
              {clearLabel ?? "清除"}
            </button>
          )}
          {options.map((o) => (
            <button
              type="button"
              key={o.value}
              onClick={() => pick(o.value)}
              style={{ ...optionRowStyle, ...(o.value === value ? activeRow : null) }}
            >
              <Chip label={o.label} color={o.color} size="sm" />
              {o.recommendedTag && <span style={recTagStyle}>{o.recommendedTag}</span>}
              {o.value === value && <span style={checkStyle}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiProps<V extends string> {
  values: V[];
  options: ChipOption<V>[];
  onChange: (next: V[]) => void | Promise<void>;
  emptyChip?: { label: string; color: AirtableColor };
}

export function EditableMultiChipCell<V extends string>({
  values,
  options,
  onChange,
  emptyChip
}: MultiProps<V>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  async function toggle(v: V) {
    const next = values.includes(v) ? values.filter((x) => x !== v) : [...values, v];
    await onChange(next);
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }} onClick={stop}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        style={triggerStyle}
      >
        {values.length === 0 ? (
          emptyChip ? <Chip label={emptyChip.label} color={emptyChip.color} /> : <span style={fallbackStyle}>—</span>
        ) : (
          <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
            {values.map((v) => {
              const o = options.find((x) => x.value === v);
              return o ? <Chip key={v} label={o.label} color={o.color} /> : null;
            })}
          </span>
        )}
        <span style={caretStyle}>▾</span>
      </button>
      {open && (
        <div style={popoverStyle}>
          {options.map((o) => {
            const selected = values.includes(o.value);
            return (
              <button
                type="button"
                key={o.value}
                onClick={() => toggle(o.value)}
                style={{ ...optionRowStyle, ...(selected ? activeRow : null) }}
              >
                <Chip label={o.label} color={o.color} size="sm" />
                {selected && <span style={checkStyle}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const triggerStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid transparent",
  padding: "2px 4px",
  borderRadius: 6,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 4
};

const caretStyle: React.CSSProperties = { color: "#7a9cc6", fontSize: 10 };
const fallbackStyle: React.CSSProperties = { color: "#7a9cc6", fontSize: 12 };

const popoverStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  marginTop: 4,
  background: "#0f2136",
  border: "1px solid #2c4f70",
  borderRadius: 8,
  padding: 6,
  minWidth: 200,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  zIndex: 20,
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
};

const optionRowStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "6px 8px",
  borderRadius: 4,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  textAlign: "left"
};

const activeRow: React.CSSProperties = { background: "#142940" };

const checkStyle: React.CSSProperties = { marginLeft: "auto", color: "#7cc48a", fontSize: 12 };

const clearBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "4px 8px",
  color: "#7a9cc6",
  fontSize: 12,
  cursor: "pointer",
  textAlign: "left",
  borderBottom: "1px solid #1f3b58",
  marginBottom: 4
};

const recTagStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#7cc48a",
  background: "rgba(38,96,58,0.25)",
  border: "1px solid #26603a",
  padding: "1px 6px",
  borderRadius: 10
};
