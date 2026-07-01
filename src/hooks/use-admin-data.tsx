"use client";

import { createContext, type Dispatch, type ReactNode, type SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  localStorageKeys,
  normalizeAdminData,
  seedAdminData,
  type AdminData,
  type AdminDataKey,
  type AdminTableName
} from "@/lib/admin-data";
import type { AppAccountStock, AppRecord, Customer, FileFolder, GroupMember, ServiceAccount, ShareGroup, Transaction, UploadedFile } from "@/lib/types";

type AdminDataContextValue = {
  apps: AppRecord[];
  setApps: Dispatch<SetStateAction<AppRecord[]>>;
  serviceAccounts: ServiceAccount[];
  setServiceAccounts: Dispatch<SetStateAction<ServiceAccount[]>>;
  shareGroups: ShareGroup[];
  setShareGroups: Dispatch<SetStateAction<ShareGroup[]>>;
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  groupMembers: GroupMember[];
  setGroupMembers: Dispatch<SetStateAction<GroupMember[]>>;
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  fileFolders: FileFolder[];
  setFileFolders: Dispatch<SetStateAction<FileFolder[]>>;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: Dispatch<SetStateAction<UploadedFile[]>>;
  stockAccounts: AppAccountStock[];
  setStockAccounts: Dispatch<SetStateAction<AppAccountStock[]>>;
  isLoading: boolean;
  dataError: string | null;
  isSupabaseEnabled: boolean;
  refreshData: () => Promise<void>;
};

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

const tableByKey: Record<AdminDataKey, AdminTableName> = {
  apps: "apps",
  service_accounts: "service_accounts",
  share_groups: "share_groups",
  customers: "customers",
  group_members: "group_members",
  transactions: "transactions",
  file_folders: "file_folders",
  uploaded_files: "uploaded_files",
  app_account_stock: "app_account_stock"
};

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hasSupabasePublicEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function readLocalData(): AdminData {
  const next = { ...seedAdminData };
  for (const key of Object.keys(localStorageKeys) as (keyof typeof localStorageKeys)[]) {
    if (!(key in seedAdminData)) continue;
    try {
      const stored = window.localStorage.getItem(localStorageKeys[key]);
      if (stored) {
        (next as Record<string, unknown>)[key] = JSON.parse(stored);
      }
    } catch {
      // Keep seed data if a local fallback value is corrupt.
    }
  }
  return normalizeAdminData(next);
}

function writeLocalTable(key: AdminDataKey, rows: unknown[]) {
  window.localStorage.setItem(localStorageKeys[key], JSON.stringify(rows));
}

async function patchSupabaseTable(key: AdminDataKey, rows: unknown[]) {
  const response = await fetch("/api/admin-data", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table: tableByKey[key], rows })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? "Failed to sync Supabase data.");
}

function resolveAction<T>(action: SetStateAction<T[]>, current: T[]) {
  return typeof action === "function" ? (action as (value: T[]) => T[])(current) : action;
}

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AdminData>(() => normalizeAdminData(seedAdminData));
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const isSupabaseEnabled = hasSupabasePublicEnv();

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);

    if (!isSupabaseEnabled) {
      setData(readLocalData());
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin-data", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Failed to load Supabase data.");
      setData(normalizeAdminData(result.data ?? {}));
    } catch (error) {
      setDataError(error instanceof Error ? error.message : "Failed to load Supabase data.");
    } finally {
      setIsLoading(false);
    }
  }, [isSupabaseEnabled]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const makeSetter = useCallback(<K extends AdminDataKey>(key: K): Dispatch<SetStateAction<AdminData[K]>> => {
    return (action) => {
      setData((current) => {
        const currentRows = current[key] as unknown[];
        const nextRows = resolveAction(action as SetStateAction<unknown[]>, currentRows) as AdminData[K];
        const nextData = normalizeAdminData({ ...current, [key]: nextRows });

        if (isSupabaseEnabled) {
          patchSupabaseTable(key, nextRows).catch((error) => {
            setDataError(error instanceof Error ? error.message : "Failed to sync Supabase data.");
            void refreshData();
          });
        } else {
          writeLocalTable(key, nextRows);
        }

        return nextData;
      });
    };
  }, [isSupabaseEnabled, refreshData]);

  const value = useMemo<AdminDataContextValue>(() => ({
    apps: data.apps,
    setApps: makeSetter("apps"),
    serviceAccounts: data.service_accounts,
    setServiceAccounts: makeSetter("service_accounts"),
    shareGroups: data.share_groups,
    setShareGroups: makeSetter("share_groups"),
    customers: data.customers,
    setCustomers: makeSetter("customers"),
    groupMembers: data.group_members,
    setGroupMembers: makeSetter("group_members"),
    transactions: data.transactions,
    setTransactions: makeSetter("transactions"),
    fileFolders: data.file_folders,
    setFileFolders: makeSetter("file_folders"),
    uploadedFiles: data.uploaded_files,
    setUploadedFiles: makeSetter("uploaded_files"),
    stockAccounts: data.app_account_stock,
    setStockAccounts: makeSetter("app_account_stock"),
    isLoading,
    dataError,
    isSupabaseEnabled,
    refreshData
  }), [data, dataError, isLoading, isSupabaseEnabled, makeSetter, refreshData]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const value = useContext(AdminDataContext);
  if (!value) throw new Error("useAdminData must be used inside AdminDataProvider.");
  return value;
}
