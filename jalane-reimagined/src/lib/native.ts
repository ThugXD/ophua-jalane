/**
 * Helpers para detectar e usar funcionalidades nativas do Capacitor.
 * Em ambiente web (browser/Lovable preview), as chamadas nativas são ignoradas.
 */
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // "ios" | "android" | "web"

/** Configura status bar + esconde splash screen quando a app arranca em nativo. */
export async function initNativeApp() {
  if (!isNative) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (platform === "android") {
      await StatusBar.setBackgroundColor({ color: "#0F172A" });
    }
  } catch (e) {
    console.warn("StatusBar init failed", e);
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch (e) {
    console.warn("SplashScreen hide failed", e);
  }

  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (e) {
    console.warn("App back-button listener failed", e);
  }
}
