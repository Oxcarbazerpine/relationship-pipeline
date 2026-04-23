import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "./i18n";
import { ChannelsProvider } from "./ChannelsContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sidebar } from "./components/Sidebar";

const StageKanban = lazy(() => import("./pages/StageKanban").then((m) => ({ default: m.StageKanban })));
const RelationshipList = lazy(() => import("./pages/RelationshipList").then((m) => ({ default: m.RelationshipList })));
const ActionCalendar = lazy(() => import("./pages/ActionCalendar").then((m) => ({ default: m.ActionCalendar })));
const InsightsDashboard = lazy(() => import("./pages/InsightsDashboard").then((m) => ({ default: m.InsightsDashboard })));
const ChannelsSettings = lazy(() => import("./pages/ChannelsSettings").then((m) => ({ default: m.ChannelsSettings })));

export default function App() {
  const { i18n } = useTranslation();

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <ChannelsProvider>
        <div style={styles.shell}>
          <Sidebar />
          <div style={styles.main}>
            <div style={styles.topbar}>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                style={styles.langSelect}
              >
                {supportedLanguages.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <Suspense fallback={<div style={styles.fallback}>…</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/insights/dashboard" replace />} />
                <Route path="/pipeline/list" element={<RelationshipList />} />
                <Route path="/pipeline/kanban" element={<StageKanban />} />
                <Route path="/action/calendar" element={<ActionCalendar />} />
                <Route path="/insights/dashboard" element={<InsightsDashboard />} />
                <Route path="/settings/channels" element={<ChannelsSettings />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </ChannelsProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    background: "#0b1c2e",
    fontFamily: "system-ui",
    color: "#e3edf5"
  },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  topbar: {
    padding: "12px 24px",
    borderBottom: "1px solid #1f3b58",
    display: "flex",
    justifyContent: "flex-end"
  },
  langSelect: {
    background: "#1a3550",
    color: "#cfe1f2",
    border: "1px solid #2c4f70",
    padding: "6px 10px",
    borderRadius: 6
  },
  fallback: { padding: 24, color: "#7a9cc6" }
};
