import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import "./i18n";

const connections = [
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("title")}</Text>
        <View style={styles.languageRow}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.value}
              style={styles.languageButton}
              onPress={() => i18n.changeLanguage(language.value)}
            >
              <Text>{language.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>{t("trial")}</Text>
        <Text style={styles.bannerSub}>{t("signIn")}</Text>
      </View>

      <View style={styles.list}>
        {connections.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.id}</Text>
            <Text style={styles.cardMeta}>{t("stage")}: {item.stage}</Text>
            <Text style={styles.cardMeta}>{t("nextAction")}: {item.nextAction}</Text>
          </View>
        ))}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "600"
  },
  languageRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8
  },
  languageButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 8
  },
  banner: {
    backgroundColor: "#f5f6ff",
    padding: 16,
    borderRadius: 12
  },
  bannerText: {
    fontWeight: "600"
  },
  bannerSub: {
    marginTop: 6,
    color: "#666"
  },
  list: {
    marginTop: 20,
    gap: 12
  },
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    borderRadius: 12
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600"
  },
  cardMeta: {
    marginTop: 4,
    color: "#444"
  }
});
