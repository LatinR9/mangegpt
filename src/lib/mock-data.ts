import type { AppAccountStock, AppRecord, AppSettings, Customer, FileFolder, GroupMember, ServiceAccount, ShareGroup, TelegramSettings, Transaction, UploadedFile } from "@/lib/types";

export const appSettings: AppSettings = {
  id: "settings-main",
  site_name: "SubGroup Manager",
  site_logo_url: "",
  site_description: "Private admin dashboard for shared subscriptions.",
  primary_color: "#3b82f6",
  accent_color: "#2563eb"
};

export const apps: AppRecord[] = [
  { id: "app-stream", name: "StreamBox", logo_url: "https://api.dicebear.com/8.x/shapes/svg?seed=StreamBox", color: "#0f766e", default_seats: 5, note: "Family streaming plan", status: "active" },
  { id: "app-design", name: "DesignCloud", logo_url: "https://api.dicebear.com/8.x/shapes/svg?seed=DesignCloud", color: "#be123c", default_seats: 4, note: "Design suite workspace", status: "active" },
  { id: "app-ai", name: "AI Studio", logo_url: "https://api.dicebear.com/8.x/shapes/svg?seed=AIStudio", color: "#7c3aed", default_seats: 6, note: "Shared productivity account", status: "paused" }
];

export const serviceAccounts: ServiceAccount[] = [
  { id: "svc-1", app_id: "app-stream", label: "StreamBox Main", login_email: "admin.streambox@example.test", account_type: "shared", password: "str-mock-private", password_encrypted: "mock_encrypted_value_1", password_hint: "str", expiry_date: "2026-07-05", cost: 58, note: "Renew with annual discount" },
  { id: "svc-2", app_id: "app-design", label: "DesignCloud Team", login_email: "billing.designcloud@example.test", account_type: "shared", password: "des-mock-private", password_encrypted: "mock_encrypted_value_2", password_hint: "des", expiry_date: "2026-07-20", cost: 96, note: "Owner MFA enabled" },
  { id: "svc-3", app_id: "app-ai", label: "AI Studio North", login_email: "ops.aistudio@example.test", account_type: "private", password: "ais-mock-private", password_encrypted: "mock_encrypted_value_3", password_hint: "ais", expiry_date: "2026-06-29", cost: 120, note: "Paused for review" }
];

export const shareGroups: ShareGroup[] = [
  { id: "grp-1", app_id: "app-stream", service_account_id: "svc-1", group_name: "StreamBox July A", seats_total: 5, expiry_date: "2026-07-01", note: "One unpaid member" },
  { id: "grp-2", app_id: "app-design", service_account_id: "svc-2", group_name: "DesignCloud Creators", seats_total: 4, expiry_date: "2026-07-20", note: "Healthy group" },
  { id: "grp-3", app_id: "app-ai", service_account_id: "svc-3", group_name: "AI Studio Trial", seats_total: 6, expiry_date: "2026-06-29", note: "Expired mock group" }
];

export const customers: Customer[] = [
  { id: "cus-1", nickname: "Mina", full_name: "Mina Park", phone: "080-100-0001", line_id: "mina.mock", facebook_url: null, telegram_username: "mina_mock", profile_image_url: "https://api.dicebear.com/8.x/avataaars/svg?seed=Mina", note: "Pays early" },
  { id: "cus-2", nickname: "Nate", full_name: "Nate Reed", phone: "080-100-0002", line_id: "nate.mock", facebook_url: null, telegram_username: "nate_mock", profile_image_url: "https://api.dicebear.com/8.x/avataaars/svg?seed=Nate", note: "Prefers Telegram" },
  { id: "cus-3", nickname: "June", full_name: "June Lee", phone: "080-100-0003", line_id: "june.mock", facebook_url: "https://facebook.example.test/june", telegram_username: null, profile_image_url: "https://api.dicebear.com/8.x/avataaars/svg?seed=June", note: "Partial payment this month" },
  { id: "cus-4", nickname: "Owen", full_name: "Owen Blake", phone: "080-100-0004", line_id: null, facebook_url: null, telegram_username: "owen_mock", profile_image_url: "https://api.dicebear.com/8.x/avataaars/svg?seed=Owen", note: null },
  { id: "cus-5", nickname: "Pim", full_name: "Pim Carter", phone: "080-100-0005", line_id: "pim.mock", facebook_url: null, telegram_username: null, profile_image_url: "https://api.dicebear.com/8.x/avataaars/svg?seed=Pim", note: "Renewal unknown" }
];

export const groupMembers: GroupMember[] = [
  { id: "mem-1", group_id: "grp-1", seat_no: 1, customer_id: "cus-1", paid_status: "paid", paid_amount: 18, payment_date: "2026-06-20", wants_renewal: "yes", member_expiry_date: "2026-07-01", note: null },
  { id: "mem-2", group_id: "grp-1", seat_no: 2, customer_id: "cus-2", paid_status: "unpaid", paid_amount: 0, payment_date: null, wants_renewal: "unknown", member_expiry_date: "2026-07-01", note: "Follow up" },
  { id: "mem-3", group_id: "grp-1", seat_no: 3, customer_id: "cus-3", paid_status: "partial", paid_amount: 7, payment_date: "2026-06-22", wants_renewal: "yes", member_expiry_date: "2026-07-01", note: "Balance pending" },
  { id: "mem-4", group_id: "grp-2", seat_no: 1, customer_id: "cus-4", paid_status: "paid", paid_amount: 32, payment_date: "2026-06-18", wants_renewal: "yes", member_expiry_date: "2026-07-20", note: null },
  { id: "mem-5", group_id: "grp-2", seat_no: 2, customer_id: "cus-5", paid_status: "paid", paid_amount: 32, payment_date: "2026-06-18", wants_renewal: "unknown", member_expiry_date: "2026-07-20", note: null }
];

export const transactions: Transaction[] = [
  { id: "txn-1", type: "income", amount: 18, category: "Seat payment", app_id: "app-stream", group_id: "grp-1", customer_id: "cus-1", date: "2026-06-20", note: "Seat 1", slip_url: null, color: "#10b981" },
  { id: "txn-2", type: "income", amount: 7, category: "Partial seat payment", app_id: "app-stream", group_id: "grp-1", customer_id: "cus-3", date: "2026-06-22", note: "Partial", slip_url: null, color: "#22c55e" },
  { id: "txn-3", type: "income", amount: 64, category: "Seat payment", app_id: "app-design", group_id: "grp-2", customer_id: null, date: "2026-06-18", note: "Two seats", slip_url: null, color: "#14b8a6" },
  { id: "txn-4", type: "expense", amount: 58, category: "Subscription cost", app_id: "app-stream", group_id: "grp-1", customer_id: null, date: "2026-06-01", note: "Mock service cost", slip_url: null, color: "#ef4444" },
  { id: "txn-5", type: "expense", amount: 96, category: "Subscription cost", app_id: "app-design", group_id: "grp-2", customer_id: null, date: "2026-06-02", note: "Mock service cost", slip_url: null, color: "#f97316" }
];

export const telegramSettings: TelegramSettings[] = [
  { id: "tg-1", bot_token: "", bot_token_encrypted: "mock_encrypted_token", bot_token_hint: "bot", chat_id: "", chat_id_encrypted: "mock_encrypted_chat", chat_id_hint: "cha", reminder_days_before: 3, reminder_days_before_expiry: 3, enabled: true, default_message_template: "Reminder: {app_name} / {group_name}\nExpiry: {expiry_date}\nPaid: {paid_count}\nUnpaid: {unpaid_count}" }
];

export const fileFolders: FileFolder[] = [
  { id: "folder-slips", name: "Payment slips / สลิปโอนเงิน", color: "#22c55e", note: "Payment proof images", created_at: "2026-07-01T00:00:00.000Z" },
  { id: "folder-products", name: "Product images / รูปสินค้า", color: "#3b82f6", note: "Product and plan visuals", created_at: "2026-07-01T00:00:00.000Z" },
  { id: "folder-customers", name: "Customer profiles / รูปลูกค้า", color: "#a855f7", note: "Customer profile assets", created_at: "2026-07-01T00:00:00.000Z" },
  { id: "folder-accounts", name: "App accounts / รูปบัญชีแอพ", color: "#f59e0b", note: "Account screenshots", created_at: "2026-07-01T00:00:00.000Z" },
  { id: "folder-other", name: "Other / อื่นๆ", color: "#64748b", note: "Miscellaneous files", created_at: "2026-07-01T00:00:00.000Z" }
];

export const uploadedFiles: UploadedFile[] = [
  { id: "file-1", folder_id: "folder-products", file_name: "streambox-plan.png", file_url: "https://api.dicebear.com/8.x/shapes/svg?seed=streambox-file", file_type: "image/svg+xml", file_size: 42000, note: "Mock product image", created_at: "2026-07-01T00:00:00.000Z" },
  { id: "file-2", folder_id: "folder-accounts", file_name: "account-screen.png", file_url: "https://api.dicebear.com/8.x/shapes/svg?seed=account-file", file_type: "image/svg+xml", file_size: 51000, note: "Mock account screenshot", created_at: "2026-07-01T00:00:00.000Z" }
];

export const appAccountStock: AppAccountStock[] = [
  { id: "stock-1", app_id: "app-stream", label: "StreamBox unsold A", login_email: "stock.streambox.a@example.test", password: "stock-stream-a", password_encrypted: "mock_stock_encrypted_1", account_type: "shared", cost: 58, selling_price: 95, status: "available", purchase_date: "2026-06-25", expiry_date: "2026-07-25", supplier: "Mock Supplier A", note: "Ready for sale", image_url: "https://api.dicebear.com/8.x/shapes/svg?seed=stock-stream", folder_file_id: "file-2" },
  { id: "stock-2", app_id: "app-design", label: "DesignCloud reserved seat", login_email: "stock.design@example.test", password: "stock-design-b", password_encrypted: "mock_stock_encrypted_2", account_type: "private", cost: 96, selling_price: 145, status: "reserved", purchase_date: "2026-06-20", expiry_date: "2026-07-05", supplier: "Mock Supplier B", note: "Waiting for payment", image_url: null, folder_file_id: null }
];
