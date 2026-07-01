"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { localStorageKeys, seedTelegramSettingsValue } from "@/lib/admin-data";
import type { TelegramSettings } from "@/lib/types";

function hasSupabasePublicEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function resolveAction<T>(action: SetStateAction<T>, current: T) {
  return typeof action === "function" ? (action as (value: T) => T)(current) : action;
}

export function useTelegramSettings(): [TelegramSettings, Dispatch<SetStateAction<TelegramSettings>>, boolean, string | null] {
  const [settings, setSettingsState] = useState<TelegramSettings>(seedTelegramSettingsValue);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabaseEnabled = hasSupabasePublicEnv();

  useEffect(() => {
    let active = true;

    async function load() {
      setReady(false);
      setError(null);

      if (!supabaseEnabled) {
        try {
          const stored = window.localStorage.getItem(localStorageKeys.telegram_settings);
          if (stored && active) setSettingsState(JSON.parse(stored) as TelegramSettings);
        } catch {
          if (active) setSettingsState(seedTelegramSettingsValue);
        } finally {
          if (active) setReady(true);
        }
        return;
      }

      try {
        const response = await fetch("/api/admin-data", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Failed to load Telegram settings.");
        if (active && result.telegram_settings) setSettingsState(result.telegram_settings as TelegramSettings);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load Telegram settings.");
      } finally {
        if (active) setReady(true);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [supabaseEnabled]);

  const setSettings: Dispatch<SetStateAction<TelegramSettings>> = (action) => {
    setSettingsState((current) => {
      const next = resolveAction(action, current);
      if (supabaseEnabled) {
        fetch("/api/admin-data", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table: "telegram_settings", row: next })
        }).then(async (response) => {
          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error ?? "Failed to save Telegram settings.");
          }
        }).catch((saveError) => setError(saveError instanceof Error ? saveError.message : "Failed to save Telegram settings."));
      } else {
        window.localStorage.setItem(localStorageKeys.telegram_settings, JSON.stringify(next));
      }
      return next;
    });
  };

  return [settings, setSettings, ready, error];
}
