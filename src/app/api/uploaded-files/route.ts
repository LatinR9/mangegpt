import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { UploadedFile } from "@/lib/types";

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

function errorResponse(error: unknown) {
  console.error("Supabase API error:", error);
  return NextResponse.json({ error: serializeError(error) }, { status: 500 });
}

function isValidDateValue(value: unknown) {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "string" || typeof value === "number") return !Number.isNaN(new Date(value).getTime());
  return false;
}

function cleanNewRowForSupabase(row: Record<string, unknown>) {
  const now = new Date().toISOString();
  const cleaned = { ...row };

  if (!cleaned.created_at || !isValidDateValue(cleaned.created_at)) {
    cleaned.created_at = now;
  }

  if (!cleaned.updated_at || !isValidDateValue(cleaned.updated_at)) {
    cleaned.updated_at = now;
  }

  return cleaned;
}

function cleanUpdateForSupabase(row: Record<string, unknown>) {
  const cleaned = { ...row };

  if ("created_at" in cleaned && (!cleaned.created_at || !isValidDateValue(cleaned.created_at))) {
    delete cleaned.created_at;
  }

  if ("updated_at" in cleaned && (!cleaned.updated_at || !isValidDateValue(cleaned.updated_at))) {
    delete cleaned.updated_at;
  }

  return { ...cleaned, updated_at: new Date().toISOString() };
}

async function readRow(request: NextRequest) {
  const body = await request.json();
  return (body?.row ?? body) as Partial<UploadedFile>;
}

export async function GET(request: NextRequest) {
  if (!isAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseClient();
  if (!supabase) return missingEnvResponse();

  try {
    const { data, error } = await supabase.from("uploaded_files").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  if (!isAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseClient();
  if (!supabase) return missingEnvResponse();

  try {
    const row = await readRow(request);
    if (!row.id || !row.folder_id || !row.file_name || !row.file_url) {
      return NextResponse.json({ error: "File id, folder_id, file_name, and file_url are required." }, { status: 400 });
    }
    if (row.file_url.startsWith("blob:")) {
      return NextResponse.json({ error: "Blob preview URLs cannot be saved. Upload the file first or use a permanent URL." }, { status: 400 });
    }

    const { data, error } = await supabase.from("uploaded_files").insert(cleanNewRowForSupabase(row as Record<string, unknown>)).select("*").single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseClient();
  if (!supabase) return missingEnvResponse();

  try {
    const row = await readRow(request);
    if (!row.id) return NextResponse.json({ error: "File id is required." }, { status: 400 });
    if (row.file_url?.startsWith("blob:")) {
      return NextResponse.json({ error: "Blob preview URLs cannot be saved. Upload the file first or use a permanent URL." }, { status: 400 });
    }

    const { id, ...updates } = row;
    const { data, error } = await supabase.from("uploaded_files").update(cleanUpdateForSupabase(updates as Record<string, unknown>)).eq("id", id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseClient();
  if (!supabase) return missingEnvResponse();

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "File id is required." }, { status: 400 });

    const { data, error } = await supabase.from("uploaded_files").delete().eq("id", id).select("*").single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
