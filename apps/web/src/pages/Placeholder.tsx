interface Props {
  title: string;
  breadcrumb: string;
}

export function Placeholder({ title, breadcrumb }: Props) {
  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>{breadcrumb}</div>
      <h2 style={styles.title}>{title}</h2>
      <div style={styles.body}>Coming soon.</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { flex: 1, padding: 24, color: "#e3edf5" },
  breadcrumb: { fontSize: 14, color: "#7a9cc6", marginBottom: 8 },
  title: { margin: "4px 0 12px" },
  body: { color: "#7a9cc6" }
};
