import { airtableChip, type AirtableColor } from "../airtableColors";

interface ChipProps {
  label: string;
  color: AirtableColor;
  size?: "sm" | "md";
}

export function Chip({ label, color, size = "sm" }: ChipProps) {
  const tone = airtableChip[color];
  return (
    <span
      style={{
        background: tone.bg,
        color: tone.fg,
        border: `1px solid ${tone.border}`,
        borderRadius: 6,
        padding: size === "md" ? "3px 10px" : "2px 8px",
        fontSize: size === "md" ? 13 : 12,
        display: "inline-block",
        whiteSpace: "nowrap"
      }}
    >
      {label}
    </span>
  );
}
