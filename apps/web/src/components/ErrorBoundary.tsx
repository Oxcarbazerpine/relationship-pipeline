import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={styles.wrap}>
        <div style={styles.box}>
          <div style={styles.title}>出错了</div>
          <div style={styles.msg}>{this.state.error.message}</div>
          <div style={styles.row}>
            <button onClick={this.reset} style={styles.btn}>重试</button>
            <button onClick={() => location.reload()} style={styles.btnAlt}>刷新页面</button>
          </div>
          <pre style={styles.stack}>{this.state.error.stack}</pre>
        </div>
      </div>
    );
  }
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", padding: 40, background: "#0b1c2e", color: "#e3edf5", fontFamily: "system-ui" },
  box: { maxWidth: 720, margin: "0 auto" },
  title: { fontSize: 24, fontWeight: 600, marginBottom: 12 },
  msg: { color: "#ff9090", background: "#3a1a1a", border: "1px solid #5a2a2a", padding: 12, borderRadius: 8, marginBottom: 12 },
  row: { display: "flex", gap: 8, marginBottom: 20 },
  btn: { background: "#4b6cb7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer" },
  btnAlt: { background: "transparent", color: "#cfe1f2", border: "1px solid #2c4f70", padding: "8px 16px", borderRadius: 6, cursor: "pointer" },
  stack: { whiteSpace: "pre-wrap", fontSize: 11, color: "#7a9cc6", background: "#0f2136", padding: 12, borderRadius: 8, border: "1px solid #1f3b58", overflow: "auto", maxHeight: 400 }
};
