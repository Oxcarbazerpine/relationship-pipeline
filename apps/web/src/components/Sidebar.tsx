import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "sidebar.collapsed";

interface NavItem {
  to: string;
  icon: string;
  labelKey: string;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    titleKey: "nav.insights",
    items: [{ to: "/insights/dashboard", icon: "📊", labelKey: "nav.insightsDashboard" }]
  },
  {
    titleKey: "nav.pipeline",
    items: [
      { to: "/pipeline/list", icon: "📋", labelKey: "nav.pipelineList" },
      { to: "/pipeline/kanban", icon: "🗂", labelKey: "nav.pipelineKanban" }
    ]
  },
  {
    titleKey: "nav.action",
    items: [{ to: "/action/calendar", icon: "📅", labelKey: "nav.actionCalendar" }]
  },
  {
    titleKey: "nav.settings",
    items: [{ to: "/settings/channels", icon: "⚙", labelKey: "nav.channels" }]
  }
];

export function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <nav style={{ ...styles.nav, width: collapsed ? 56 : 220 }}>
      <div style={styles.header}>
        {!collapsed && <div style={styles.logo}>{t("title")}</div>}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          style={styles.toggle}
          aria-label={collapsed ? "expand sidebar" : "collapse sidebar"}
          title={collapsed ? "展开" : "折叠"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.titleKey} style={styles.section}>
          {!collapsed && <div style={styles.sectionTitle}>{t(section.titleKey)}</div>}
          {collapsed && <div style={styles.sectionDivider} />}
          {section.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={t(item.labelKey) as string}
              style={({ isActive }) => ({
                ...styles.item,
                ...(collapsed ? styles.itemCollapsed : null),
                ...(isActive ? styles.itemActive : null)
              })}
            >
              <span style={styles.itemIcon}>{item.icon}</span>
              {!collapsed && <span style={styles.itemLabel}>{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: "#155a8a",
    minHeight: "100vh",
    padding: "12px 0",
    color: "#fff",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    transition: "width 160ms ease",
    overflow: "hidden"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px 14px",
    minHeight: 34
  },
  logo: {
    flex: 1,
    fontWeight: 700,
    fontSize: 17,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  toggle: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#fff",
    width: 28,
    height: 28,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  section: { padding: "4px 0" },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#cfe1f2",
    fontWeight: 600,
    padding: "10px 16px 6px",
    whiteSpace: "nowrap"
  },
  sectionDivider: {
    height: 1,
    background: "rgba(255,255,255,0.12)",
    margin: "8px 10px"
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 16px 6px 21px",
    color: "#cfe1f2",
    textDecoration: "none",
    fontSize: 14,
    borderLeft: "3px solid transparent",
    whiteSpace: "nowrap",
    overflow: "hidden"
  },
  itemCollapsed: {
    padding: "8px 0",
    justifyContent: "center",
    borderLeft: "3px solid transparent"
  },
  itemActive: {
    background: "rgba(255,255,255,0.12)",
    borderLeft: "3px solid #fff",
    color: "#fff",
    fontWeight: 600
  },
  itemIcon: { fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 },
  itemLabel: { overflow: "hidden", textOverflow: "ellipsis" }
};
