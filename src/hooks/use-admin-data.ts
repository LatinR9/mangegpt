"use client";

import { useMemo } from "react";
import { apps as seedApps, customers as seedCustomers, groupMembers as seedGroupMembers, serviceAccounts as seedServiceAccounts, shareGroups as seedShareGroups, transactions as seedTransactions } from "@/lib/mock-data";
import type { AppRecord, Customer, GroupMember, ServiceAccount, ShareGroup, Transaction } from "@/lib/types";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeServiceAccounts(accounts: ServiceAccount[]) {
  return accounts.map((account) => ({
    ...account,
    account_type: account.account_type ?? "shared",
    password: account.password ?? account.password_hint ?? ""
  }));
}

function normalizeTransactions(rows: Transaction[]) {
  return rows.map((row) => ({
    ...row,
    color: row.color ?? (row.type === "income" ? "#10b981" : "#ef4444")
  }));
}

const normalizedSeedServiceAccounts = normalizeServiceAccounts(seedServiceAccounts);
const normalizedSeedTransactions = normalizeTransactions(seedTransactions);

export function useAdminData() {
  const [apps, setApps] = useLocalStorageState<AppRecord[]>("sgm.apps", seedApps);
  const [serviceAccounts, setServiceAccounts] = useLocalStorageState<ServiceAccount[]>("sgm.serviceAccounts", normalizedSeedServiceAccounts);
  const [shareGroups, setShareGroups] = useLocalStorageState<ShareGroup[]>("sgm.shareGroups", seedShareGroups);
  const [customers, setCustomers] = useLocalStorageState<Customer[]>("sgm.customers", seedCustomers);
  const [groupMembers, setGroupMembers] = useLocalStorageState<GroupMember[]>("sgm.groupMembers", seedGroupMembers);
  const [transactions, setTransactions] = useLocalStorageState<Transaction[]>("sgm.transactions", normalizedSeedTransactions);
  const normalizedServiceAccounts = useMemo(() => normalizeServiceAccounts(serviceAccounts), [serviceAccounts]);
  const normalizedTransactions = useMemo(() => normalizeTransactions(transactions), [transactions]);

  return useMemo(() => ({
    apps,
    setApps,
    serviceAccounts: normalizedServiceAccounts,
    setServiceAccounts,
    shareGroups,
    setShareGroups,
    customers,
    setCustomers,
    groupMembers,
    setGroupMembers,
    transactions: normalizedTransactions,
    setTransactions
  }), [apps, customers, groupMembers, normalizedServiceAccounts, normalizedTransactions, setApps, setCustomers, setGroupMembers, setServiceAccounts, setShareGroups, setTransactions, shareGroups]);
}
