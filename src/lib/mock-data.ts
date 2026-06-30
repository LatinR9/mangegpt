import type { AppRecord, Customer, GroupMember, ServiceAccount, ShareGroup, TelegramSettings, Transaction } from "@/lib/types";

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
  { id: "tg-1", bot_token: "", bot_token_encrypted: "mock_encrypted_token", bot_token_hint: "bot", chat_id: "", chat_id_encrypted: "mock_encrypted_chat", chat_id_hint: "cha", reminder_days_before: 3, reminder_days_before_expiry: 3, enabled: true }
];

