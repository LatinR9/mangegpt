import { NextResponse, type NextRequest } from "next/server";
import { adminTableNames, normalizeAdminData, type AdminData, type AdminTableName } from "@/lib/admin-data";
import { createServiceSupabaseClient } from "@/lib/supabase";

type PatchBody =
  | { table: AdminTableName; rows: Record<string, unknown>[] }
  | { table: "app_settings" | "telegram_settings"; row: Record<string, unknown> };

function isAllowed(request: NextRequest) {
  return request.cookies.get("sg_admin_mock")?.value === "active";
}

function missingEnvResponse() {
  return NextResponse.json({ error: "Supabase service env is missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
}

function serializeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const err = error as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [err.message, err.details, err.hint, err.code].filter(Boolean);
    return parts.length ? parts.join(" | ") : JSON.stringify(error);
  }
  return String(error);
}

function isValidDateValue(value: unknown) {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "string" || typeof value === "number") return !Number.isNaN(new Date(value).getTime());
  return false;
}

const nullableForeignKeys = [
  "app_id",
  "service_account_id",
  "group_id",
  "customer_id",
  "folder_id",
  "folder_file_id",
  "telegram_settings_id"
];

function cleanRowForSupabase(row: Record<string, unknown>) {
  const now = new Date().toISOString();
  const cleaned = { ...row };

  for (const key of nullableForeignKeys) {
    if (cleaned[key] === "") cleaned[key] = null;
  }

  if (!cleaned.created_at || !isValidDateValue(cleaned.created_at)) {
    cleaned.created_at = now;
  }

  if (!cleaned.updated_at || !isValidDateValue(cleaned.updated_at)) {
    cleaned.updated_at = now;
  }

  return cleaned;
}

async function fetchTable(table: AdminTableName) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error("Supabase service client is not configured.");
  const { data, error } = await supabase.from(table).select("*").order("id", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function syncTable(table: AdminTableName, rows: Record<string, unknown>[]) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error("Supabase service client is not configured.");

  if (rows.length > 0) {
    const cleanedRows = rows.map(cleanRowForSupabase);
    const { error: upsertError } = await supabase.from(table).upsert(cleanedRows, {
      onConflict: "id",
      defaultToNull: false
    });
    if (upsertError) throw upsertError;
  }

  const nextIds = rows.map((row) => String(row.id)).filter(Boolean);
  const { data: existingRows, error: existingError } = await supabase.from(table).select("id");
  if (existingError) throw existingError;

  const idsToDelete = (existingRows ?? []).map((row) => String(row.id)).filter((id) => !nextIds.includes(id));
  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase.from(table).delete().in("id", idsToDelete);
    if (deleteError) throw deleteError;
  }
}

async function syncSingle(table: "app_settings" | "telegram_settings", row: Record<string, unknown>) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) throw new Error("Supabase service client is not configured.");
  const { error } = await supabase.from(table).upsert(cleanRowForSupabase(row), {
    onConflict: "id",
    defaultToNull: false
  });
  if (error) throw error;
}

export async function GET(request: NextRequest) {
  if (!isAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!createServiceSupabaseClient()) return missingEnvResponse();

  try {
    const entries = await Promise.all(adminTableNames.map(async (table) => [table, await fetchTable(table)] as const));
    const data = Object.fromEntries(entries) as Partial<AdminData>;

    const supabase = createServiceSupabaseClient();
    const [{ data: appSettings, error: appSettingsError }, { data: telegramSettings, error: telegramSettingsError }] = await Promise.all([
      supabase!.from("app_settings").select("*").order("id", { ascending: true }).limit(1),
      supabase!.from("telegram_settings").select("*").order("id", { ascending: true }).limit(1)
    ]);
    if (appSettingsError) throw appSettingsError;
    if (telegramSettingsError) throw telegramSettingsError;

    return NextResponse.json({
      data: normalizeAdminData(data),
      app_settings: appSettings?.[0] ?? null,
      telegram_settings: telegramSettings?.[0] ?? null
    });
  } catch (error) {
    console.error("Supabase API error:", error);
    return NextResponse.json({ error: serializeError(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!createServiceSupabaseClient()) return missingEnvResponse();

  try {
    const body = await request.json() as PatchBody;
    if (adminTableNames.includes(body.table as AdminTableName)) {
      if (!("rows" in body) || !Array.isArray(body.rows)) {
        return NextResponse.json({ error: "Expected rows array." }, { status: 400 });
      }
      await syncTable(body.table as AdminTableName, body.rows);
      return NextResponse.json({ ok: true });
    }

    if ((body.table === "app_settings" || body.table === "telegram_settings") && "row" in body) {
      await syncSingle(body.table, body.row);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown table." }, { status: 400 });
  } catch (error) {
    console.error("Supabase API error:", error);
    return NextResponse.json({ error: serializeError(error) }, { status: 500 });
  }
}
