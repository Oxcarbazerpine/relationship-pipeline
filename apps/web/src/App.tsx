import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "./i18n";
import { ChannelsProvider } from "./ChannelsContext";
import { Sidebar } from "./components/Sidebar";
import { StageKanban } from "./pages/StageKanban";
import { RelationshipList } from "./pages/RelationshipList";
import { ActionCalendar } from "./pages/ActionCalendar";
import { InsightsDashboard } from "./pages/InsightsDashboard";
import { ChannelsSettings } from "./pages/ChannelsSettings";

export default function App() {
  const { i18n } = useTranslation();

  return (
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
            <Routes>
              <Route path="/" element={<Navigate to="/insights/dashboard" replace />} />
              <Route path="/pipeline/list" element={<RelationshipList />} />
              <Route path="/pipeline/kanban" element={<StageKanban />} />
              <Route path="/action/calendar" element={<ActionCalendar />} />
              <Route path="/insights/dashboard" element={<InsightsDashboard />} />
              <Route path="/settings/channels" element={<ChannelsSettings />} />
            </Routes>
          </div>
        </div>
      </ChannelsProvider>
    </BrowserRouter>
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
  }
};
