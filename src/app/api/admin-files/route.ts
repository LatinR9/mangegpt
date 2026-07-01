import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

function isAllowed(request: NextRequest) {
  return request.cookies.get("sg_admin_mock")?.value === "active";
}

function cleanName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "upload";
}

function createUploadId() {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  if (!isAllowed(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase service env is missing." }, { status: 503 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Missing file." }, { status: 400 });

    const path = `${new Date().toISOString().slice(0, 10)}/${createUploadId()}-${cleanName(file.name)}`;
    const { error } = await supabase.storage.from("admin-files").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false
    });
    if (error) throw error;

    const { data } = supabase.storage.from("admin-files").getPublicUrl(path);
    return NextResponse.json({
      file_url: data.publicUrl,
      file_name: file.name,
      file_type: file.type || "file",
      file_size: file.size
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
