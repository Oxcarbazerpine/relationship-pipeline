import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  zh: {
    translation: {
      title: "交往推进表",
      trial: "7天免费试用，之后订阅",
      signIn: "使用社交账号登录",
      stage: "当前阶段",
      nextAction: "下一步动作"
    }
  },
  en: {
    translation: {
      title: "Connection Pipeline",
      trial: "7-day free trial, then subscription",
      signIn: "Sign in with social account",
      stage: "Stage",
      nextAction: "Next Action"
    }
  },
  ja: {
    translation: {
      title: "関係性パイプライン",
      trial: "7日間無料、その後サブスクリプション",
      signIn: "ソーシャルアカウントでログイン",
      stage: "段階",
      nextAction: "次のアクション"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
