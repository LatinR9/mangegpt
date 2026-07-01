import {
  appAccountStock as seedStock,
  appSettings as seedAppSettings,
  apps as seedApps,
  customers as seedCustomers,
  fileFolders as seedFileFolders,
  groupMembers as seedGroupMembers,
  serviceAccounts as seedServiceAccounts,
  shareGroups as seedShareGroups,
  telegramSettings as seedTelegramSettings,
  transactions as seedTransactions,
  uploadedFiles as seedUploadedFiles
} from "@/lib/mock-data";
import type {
  AppAccountStock,
  AppRecord,
  Customer,
  FileFolder,
  GroupMember,
  ServiceAccount,
  ShareGroup,
  Transaction,
  UploadedFile
} from "@/lib/types";

export const adminTableNames = [
  "apps",
  "service_accounts",
  "share_groups",
  "customers",
  "group_members",
  "transactions",
  "file_folders",
  "uploaded_files",
  "app_account_stock"
] as const;

export type AdminTableName = (typeof adminTableNames)[number];

export type AdminData = {
  apps: AppRecord[];
  service_accounts: ServiceAccount[];
  share_groups: ShareGroup[];
  customers: Customer[];
  group_members: GroupMember[];
  transactions: Transaction[];
  file_folders: FileFolder[];
  uploaded_files: UploadedFile[];
  app_account_stock: AppAccountStock[];
};

export type AdminDataKey = keyof AdminData;

export const localStorageKeys: Record<AdminDataKey | "app_settings" | "telegram_settings", string> = {
  apps: "sgm.apps",
  service_accounts: "sgm.serviceAccounts",
  share_groups: "sgm.shareGroups",
  customers: "sgm.customers",
  group_members: "sgm.groupMembers",
  transactions: "sgm.transactions",
  file_folders: "sgm.fileFolders",
  uploaded_files: "sgm.uploadedFiles",
  app_account_stock: "sgm.appAccountStock",
  app_settings: "sgm.appSettings",
  telegram_settings: "sgm.telegramSettings"
};

export const seedAdminData: AdminData = {
  apps: seedApps,
  service_accounts: seedServiceAccounts,
  share_groups: seedShareGroups,
  customers: seedCustomers,
  group_members: seedGroupMembers,
  transactions: seedTransactions,
  file_folders: seedFileFolders,
  uploaded_files: seedUploadedFiles,
  app_account_stock: seedStock
};

export const seedAppSettingsValue = seedAppSettings;
export const seedTelegramSettingsValue = seedTelegramSettings[0];

function asNumber(value: unknown) {
  return Number(value ?? 0) || 0;
}

export function normalizeServiceAccounts(accounts: ServiceAccount[]) {
  return accounts.map((account) => ({
    ...account,
    account_type: account.account_type ?? "shared",
    password: account.password ?? account.password_hint ?? ""
  }));
}

export function normalizeTransactions(rows: Transaction[]) {
  return rows.map((row) => ({
    ...row,
    amount: asNumber(row.amount),
    color: row.color ?? (row.type === "income" ? "#10b981" : "#ef4444")
  }));
}

export function normalizeStock(rows: AppAccountStock[]) {
  return rows.map((row) => ({
    ...row,
    cost: asNumber(row.cost),
    selling_price: asNumber(row.selling_price),
    password: row.password ?? row.password_encrypted ?? ""
  }));
}

export function normalizeAdminData(data: Partial<AdminData>): AdminData {
  return {
    apps: data.apps ?? [],
    service_accounts: normalizeServiceAccounts(data.service_accounts ?? []),
    share_groups: (data.share_groups ?? []).map((row) => ({ ...row, seats_total: asNumber(row.seats_total) })),
    customers: data.customers ?? [],
    group_members: (data.group_members ?? []).map((row) => ({ ...row, seat_no: asNumber(row.seat_no), paid_amount: asNumber(row.paid_amount) })),
    transactions: normalizeTransactions(data.transactions ?? []),
    file_folders: data.file_folders ?? [],
    uploaded_files: (data.uploaded_files ?? []).map((row) => ({ ...row, file_size: row.file_size == null ? null : asNumber(row.file_size) })),
    app_account_stock: normalizeStock(data.app_account_stock ?? [])
  };
}
