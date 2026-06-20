"use client";

import { useEffect } from "react";

// Registers the service worker (so the app is installable) and keeps the
// installed app up to date: when a new version is deployed, the SW updates and
// the page reloads automatically — no need to remove and re-add the app.
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Whether a SW already controlled this page when it loaded. Used to avoid an
    // extra reload the very first time the SW takes control.
    const hadController = !!navigator.serviceWorker.controller;
    let refreshing = false;

    const onControllerChange = () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let registration: ServiceWorkerRegistration | undefined;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
      } catch {
        /* ignore */
      }
    };

    // Check for a newer version whenever the app regains focus / visibility.
    const checkForUpdate = () => registration?.update().catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    window.addEventListener("focus", checkForUpdate);
    document.addEventListener("visibilitychange", onVisible);

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("focus", checkForUpdate);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
