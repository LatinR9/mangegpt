export type AppStatus = "active" | "paused" | "archived";
export type PaidStatus = "paid" | "unpaid" | "partial";
export type RenewalIntent = "yes" | "no" | "unknown";
export type GroupStatus = "paid_all" | "partially_paid" | "unpaid" | "expired" | "expiring_soon" | "incomplete";
export type TransactionType = "income" | "expense";
export type AccountType = "private" | "shared";
export type StockStatus = "available" | "reserved" | "sold" | "expired" | "problem";

export type AppSettings = {
  id: string;
  site_name: string;
  site_logo_url: string;
  site_description: string | null;
  primary_color: string | null;
  accent_color: string | null;
};

export type AppRecord = {
  id: string;
  name: string;
  logo_url: string;
  color: string;
  default_seats: number;
  note: string | null;
  status: AppStatus;
};

export type ServiceAccount = {
  id: string;
  app_id: string;
  label: string;
  login_email: string;
  account_type: AccountType;
  password: string | null;
  password_encrypted: string | null;
  password_hint: string | null;
  expiry_date: string;
  cost: number;
  note: string | null;
};

export type ShareGroup = {
  id: string;
  app_id: string;
  service_account_id: string;
  group_name: string;
  seats_total: number;
  expiry_date: string;
  note: string | null;
};

export type Customer = {
  id: string;
  nickname: string;
  full_name: string;
  phone: string | null;
  line_id: string | null;
  facebook_url: string | null;
  telegram_username: string | null;
  profile_image_url: string | null;
  note: string | null;
};

export type GroupMember = {
  id: string;
  group_id: string;
  seat_no: number;
  customer_id: string;
  paid_status: PaidStatus;
  paid_amount: number;
  payment_date: string | null;
  wants_renewal: RenewalIntent;
  member_expiry_date: string;
  note: string | null;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  app_id: string | null;
  group_id: string | null;
  customer_id: string | null;
  date: string;
  note: string | null;
  slip_url: string | null;
  color: string;
};

export type TelegramSettings = {
  id: string;
  bot_token: string | null;
  bot_token_encrypted: string | null;
  bot_token_hint: string | null;
  chat_id: string | null;
  chat_id_encrypted: string | null;
  chat_id_hint: string | null;
  reminder_days_before: number;
  reminder_days_before_expiry: number;
  enabled: boolean;
  default_message_template: string | null;
};

export type ReminderLog = {
  id: string;
  group_id: string;
  telegram_settings_id: string;
  message: string;
  status: "prepared" | "sent" | "failed";
  created_at: string;
};

export type FileFolder = {
  id: string;
  name: string;
  color: string | null;
  note: string | null;
  created_at: string;
};

export type UploadedFile = {
  id: string;
  folder_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  note: string | null;
  created_at: string;
};

export type AppAccountStock = {
  id: string;
  app_id: string;
  label: string;
  login_email: string;
  password: string | null;
  password_encrypted: string | null;
  account_type: AccountType;
  cost: number;
  selling_price: number;
  status: StockStatus;
  purchase_date: string | null;
  expiry_date: string | null;
  supplier: string | null;
  note: string | null;
  image_url: string | null;
  folder_file_id: string | null;
};
