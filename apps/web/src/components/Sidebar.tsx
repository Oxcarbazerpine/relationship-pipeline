import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const sectionStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: "#7a9cc6",
  padding: "14px 16px 6px"
};

const itemStyle: React.CSSProperties = {
  display: "block",
  padding: "6px 24px",
  color: "#cfe1f2",
  textDecoration: "none",
  fontSize: 14,
  borderLeft: "3px solid transparent"
};

const activeStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  borderLeft: "3px solid #fff",
  color: "#fff",
  fontWeight: 600
};

export function Sidebar() {
  const { t } = useTranslation();
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>Connection Pipeline</div>

      <div style={styles.section}>
        <div style={{ ...sectionStyle, color: "#cfe1f2", fontSize: 14, fontWeight: 600 }}>
          {t("nav.pipeline")}
        </div>
        <NavLink to="/pipeline/list" style={({ isActive }) => ({ ...itemStyle, ...(isActive ? activeStyle : {}) })}>
          {t("nav.pipelineList")}
        </NavLink>
        <NavLink to="/pipeline/kanban" style={({ isActive }) => ({ ...itemStyle, ...(isActive ? activeStyle : {}) })}>
          {t("nav.pipelineKanban")}
        </NavLink>
      </div>

      <div style={styles.section}>
        <div style={{ ...sectionStyle, color: "#cfe1f2", fontSize: 14, fontWeight: 600 }}>
          {t("nav.action")}
        </div>
        <NavLink to="/action/calendar" style={({ isActive }) => ({ ...itemStyle, ...(isActive ? activeStyle : {}) })}>
          {t("nav.actionCalendar")}
        </NavLink>
      </div>

      <div style={styles.section}>
        <div style={{ ...sectionStyle, color: "#cfe1f2", fontSize: 14, fontWeight: 600 }}>
          {t("nav.insights")}
        </div>
        <NavLink to="/insights/dashboard" style={({ isActive }) => ({ ...itemStyle, ...(isActive ? activeStyle : {}) })}>
          {t("nav.insightsDashboard")}
        </NavLink>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: "#155a8a",
    width: 220,
    minHeight: "100vh",
    padding: "20px 0",
    color: "#fff",
    flexShrink: 0
  },
  logo: {
    padding: "0 20px 20px",
    fontWeight: 700,
    fontSize: 18
  },
  section: {
    padding: "4px 0"
  }
};
