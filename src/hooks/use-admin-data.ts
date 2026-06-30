"use client";

import { useMemo } from "react";
import { apps as seedApps, customers as seedCustomers, groupMembers as seedGroupMembers, serviceAccounts as seedServiceAccounts, shareGroups as seedShareGroups, transactions as seedTransactions } from "@/lib/mock-data";
import type { AppRecord, Customer, GroupMember, ServiceAccount, ShareGroup, Transaction } from "@/lib/types";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAdminData() {
  const [apps, setApps] = useLocalStorageState<AppRecord[]>("sgm.apps", seedApps);
  const [serviceAccounts, setServiceAccounts] = useLocalStorageState<ServiceAccount[]>("sgm.serviceAccounts", seedServiceAccounts);
  const [shareGroups, setShareGroups] = useLocalStorageState<ShareGroup[]>("sgm.shareGroups", seedShareGroups);
  const [customers, setCustomers] = useLocalStorageState<Customer[]>("sgm.customers", seedCustomers);
  const [groupMembers, setGroupMembers] = useLocalStorageState<GroupMember[]>("sgm.groupMembers", seedGroupMembers);
  const [transactions, setTransactions] = useLocalStorageState<Transaction[]>("sgm.transactions", seedTransactions);

  return useMemo(() => ({
    apps,
    setApps,
    serviceAccounts,
    setServiceAccounts,
    shareGroups,
    setShareGroups,
    customers,
    setCustomers,
    groupMembers,
    setGroupMembers,
    transactions,
    setTransactions
  }), [apps, customers, groupMembers, serviceAccounts, setApps, setCustomers, setGroupMembers, setServiceAccounts, setShareGroups, setTransactions, shareGroups, transactions]);
}
