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
  return error instanceof Error ? error.message : "Unknown Supabase error.";
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
    const { error: upsertError } = await supabase.from(table).upsert(rows, { onConflict: "id" });
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
  const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });
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
    return NextResponse.json({ error: serializeError(error) }, { status: 500 });
  }
}
