import { useTranslation } from "react-i18next";
import "./i18n";

const sampleConnections = [
  { id: "A", stage: "舒适期", nextAction: "轻升级测试" },
  { id: "B", stage: "暧昧期", nextAction: "明确邀约" },
  { id: "C", stage: "认识期", nextAction: "冷却" }
];

const languages = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" }
];

export default function App() {
  const { t, i18n } = useTranslation();

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>{t("title")}</h1>
          <p style={{ marginTop: 0, color: "#555" }}>{t("subtitle")}</p>
        </div>
        <select
          value={i18n.language}
          onChange={(event) => i18n.changeLanguage(event.target.value)}
          style={{ padding: 8 }}
        >
          {languages.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </header>

      <section style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <div style={{ background: "#f5f6ff", padding: 16, borderRadius: 12 }}>
          <strong>{t("trial")}</strong>
          <p style={{ marginTop: 8 }}>{t("signIn")}</p>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {sampleConnections.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{item.id}</h3>
                <p style={{ margin: "8px 0 0", color: "#444" }}>
                  {t("stage")}: {item.stage}
                </p>
              </div>
              <span style={{ background: "#edf1ff", padding: "6px 12px", borderRadius: 999 }}>
                {t("nextAction")}: {item.nextAction}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
