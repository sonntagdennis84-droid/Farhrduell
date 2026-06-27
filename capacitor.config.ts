import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.fahrduell.moderator",
  appName: "Fahrduell Moderator",
  webDir: ".next",
  server: {
    url: "https://fahrduell-production.up.railway.app/login?app=1",
    cleartext: false,
    androidScheme: "https"
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
