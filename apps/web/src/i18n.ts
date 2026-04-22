import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { zh } from "./locales/zh";
import { en } from "./locales/en";
import { ja } from "./locales/ja";

export const supportedLanguages = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" }
] as const;

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    ja: { translation: ja }
  },
  lng: "zh",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
