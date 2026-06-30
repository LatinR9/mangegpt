"use client";

import { appSettings } from "@/lib/mock-data";
import type { AppSettings } from "@/lib/types";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function useAppSettings() {
  return useLocalStorageState<AppSettings>("sgm.appSettings", appSettings);
}
