"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Check, Copy, Eye, FolderPlus, Pencil, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { createId, useAdminData } from "@/hooks/use-admin-data";
import { useLanguage } from "@/hooks/use-language";
import type { FileFolder, UploadedFile } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const emptyFolder = { name: "", color: "#3b82f6", note: "" };
const emptyFile = { folder_id: "", file_name: "", file_url: "", file_type: "", file_size: 0, note: "" };

function formatSize(size: number | null) {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function FilesPage() {
  const { fileFolders, setFileFolders, uploadedFiles, setUploadedFiles, isSupabaseEnabled, refreshData } = useAdminData();
  const { t } = useLanguage();
  const [folderForm, setFolderForm] = useState(emptyFolder);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [fileForm, setFileForm] = useState(emptyFile);
  const [browserFile, setBrowserFile] = useState<File | null>(null);
  const [filterFolder, setFilterFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const filteredFiles = useMemo(() => uploadedFiles.filter((file) => {
    const folderOk = filterFolder === "all" || file.folder_id === filterFolder;
    const search = query.trim().toLowerCase();
    const searchOk = !search || [file.file_name, file.note, file.file_type].some((value) => (value ?? "").toLowerCase().includes(search));
    return folderOk && searchOk;
  }), [filterFolder, query, uploadedFiles]);

  async function readApiError(response: Response) {
    const result = await response.json().catch(() => ({}));
    return typeof result.error === "string" ? result.error : `Request failed with status ${response.status}.`;
  }

  async function saveJson<T>(url: string, method: "POST" | "PATCH", payload: T) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(await readApiError(response));
    return response.json().catch(() => ({}));
  }

  async function deleteById(url: string, id: string) {
    const response = await fetch(`${url}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw new Error(await readApiError(response));
  }

  async function saveFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setSaved(null);
    const payload: FileFolder = {
      id: editingFolderId ?? createId("folder"),
      name: folderForm.name.trim() || "New folder",
      color: folderForm.color,
      note: folderForm.note.trim() || null,
      created_at: editingFolderId ? fileFolders.find((folder) => folder.id === editingFolderId)?.created_at ?? new Date().toISOString() : new Date().toISOString()
    };
    try {
      if (isSupabaseEnabled) {
        await saveJson("/api/file-folders", editingFolderId ? "PATCH" : "POST", payload);
        await refreshData();
      } else {
        setFileFolders((current) => editingFolderId ? current.map((folder) => folder.id === editingFolderId ? payload : folder) : [payload, ...current]);
      }
      setFolderForm(emptyFolder);
      setEditingFolderId(null);
      setSaved("Folder saved.");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Folder save failed.");
    }
  }

  function editFolder(folder: FileFolder) {
    setEditingFolderId(folder.id);
    setFolderForm({ name: folder.name, color: folder.color ?? "#3b82f6", note: folder.note ?? "" });
  }

  async function deleteFolder(id: string) {
    if (!window.confirm("Delete this folder and its files?")) return;
    setApiError(null);
    setSaved(null);
    try {
      if (isSupabaseEnabled) {
        await deleteById("/api/file-folders", id);
        await refreshData();
      } else {
        setFileFolders((current) => current.filter((folder) => folder.id !== id));
        setUploadedFiles((current) => current.filter((file) => file.folder_id !== id));
      }
      setSaved("Folder deleted.");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Folder delete failed.");
    }
  }

  async function uploadBrowserFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin-files", {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Upload failed.");
    return result as { file_url: string; file_name: string; file_type: string; file_size: number };
  }

  async function saveFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    setSaved(null);
    let fileUrl = fileForm.file_url.trim();
    let fileName = fileForm.file_name.trim();
    let fileType = fileForm.file_type.trim() || null;
    let fileSize = Number(fileForm.file_size) || null;

    if (browserFile && isSupabaseEnabled) {
      try {
        const uploaded = await uploadBrowserFile(browserFile);
        fileUrl = uploaded.file_url;
        fileName = fileName || uploaded.file_name;
        fileType = uploaded.file_type;
        fileSize = uploaded.file_size;
      } catch (error) {
        setApiError(error instanceof Error ? `Upload failed: ${error.message}` : "Upload failed.");
        return;
      }
    }

    if (fileUrl.startsWith("blob:")) {
      setApiError("Blob preview URLs cannot be saved. Upload the file to Supabase Storage or paste a permanent URL.");
      return;
    }

    const payload: UploadedFile = {
      id: createId("file"),
      folder_id: fileForm.folder_id || fileFolders[0]?.id || "",
      file_name: fileName || "uploaded-file",
      file_url: fileUrl,
      file_type: fileType,
      file_size: fileSize,
      note: fileForm.note.trim() || null,
      created_at: new Date().toISOString()
    };
    if (!payload.file_url) {
      setApiError("Add a permanent file URL or upload a browser file to Supabase Storage first.");
      return;
    }

    try {
      if (isSupabaseEnabled) {
        await saveJson("/api/uploaded-files", "POST", payload);
        await refreshData();
      } else {
        setUploadedFiles((current) => [payload, ...current]);
      }
      setFileForm({ ...emptyFile, folder_id: payload.folder_id });
      setBrowserFile(null);
      setSaved(browserFile && isSupabaseEnabled ? "File uploaded to Supabase Storage." : "File added.");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "File save failed.");
    }
  }

  function handleBrowserFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBrowserFile(file);
    setFileForm({
      ...fileForm,
      file_name: file.name,
      file_url: url,
      file_type: file.type || "file",
      file_size: file.size
    });
  }

  async function copyUrl(file: UploadedFile) {
    await navigator.clipboard.writeText(file.file_url);
    setCopiedId(file.id);
    window.setTimeout(() => setCopiedId(null), 1300);
  }

  async function deleteFile(id: string) {
    setApiError(null);
    setSaved(null);
    try {
      if (isSupabaseEnabled) {
        await deleteById("/api/uploaded-files", id);
        await refreshData();
      } else {
        setUploadedFiles((current) => current.filter((item) => item.id !== id));
      }
      setSaved("File deleted.");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "File delete failed.");
    }
  }

  return (
    <div>
      <PageHeader title={t("files")} description="Private image and file library for slips, product images, account screenshots, and business files." />
      <div className="grid min-w-0 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t("createFolder")}</CardTitle></CardHeader>
            <CardContent>
              {apiError ? <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{apiError}</p> : null}
              <form onSubmit={saveFolder} className="space-y-4">
                <div><Label>Folder name</Label><Input value={folderForm.name} onChange={(event) => setFolderForm({ ...folderForm, name: event.target.value })} /></div>
                <div><Label>Color</Label><Input type="color" value={folderForm.color} onChange={(event) => setFolderForm({ ...folderForm, color: event.target.value })} /></div>
                <div><Label>Note</Label><Textarea value={folderForm.note} onChange={(event) => setFolderForm({ ...folderForm, note: event.target.value })} /></div>
                <Button type="submit" className="w-full"><FolderPlus className="h-4 w-4" /> {editingFolderId ? t("save") : t("createFolder")}</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("uploadFile")}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveFile} className="space-y-4">
                <div><Label>Folder</Label><Select value={fileForm.folder_id || fileFolders[0]?.id || ""} onChange={(event) => setFileForm({ ...fileForm, folder_id: event.target.value })}>{fileFolders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</Select></div>
                <div><Label>File URL</Label><Input value={fileForm.file_url} onChange={(event) => setFileForm({ ...fileForm, file_url: event.target.value })} placeholder="https://..." /></div>
                <div><Label>Browser file preview</Label><Input type="file" onChange={handleBrowserFile} /></div>
                <div><Label>File name</Label><Input value={fileForm.file_name} onChange={(event) => setFileForm({ ...fileForm, file_name: event.target.value })} /></div>
                <div><Label>Note</Label><Textarea value={fileForm.note} onChange={(event) => setFileForm({ ...fileForm, note: event.target.value })} /></div>
                <p className="text-xs text-muted-foreground">Supabase-ready: production uploads should go to the admin-files bucket and save metadata in uploaded_files.</p>
                <Button type="submit" className="w-full"><Upload className="h-4 w-4" /> {t("uploadFile")}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Folders</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 xl:grid-cols-3">
              {fileFolders.map((folder) => (
                <div key={folder.id} className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="mb-3 flex min-w-0 items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: folder.color ?? "#3b82f6" }} /><p className="truncate font-medium">{folder.name}</p></div>
                  <p className="mb-3 break-words text-xs text-muted-foreground">{folder.note}</p>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><Button size="sm" variant="outline" onClick={() => editFolder(folder)}><Pencil className="h-4 w-4" /> Rename</Button><Button size="sm" variant="destructive" onClick={() => deleteFolder(folder.id)}><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>File library</CardTitle>
              <div className="grid w-full min-w-0 gap-2 sm:grid-cols-2 lg:w-auto">
                <Select value={filterFolder} onChange={(event) => setFilterFolder(event.target.value)}><option value="all">All folders</option>{fileFolders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</Select>
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search file name or note" />
              </div>
            </CardHeader>
            <CardContent>
              {apiError ? <p className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{apiError}</p> : null}
              {saved ? <p className="mb-4 rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">{saved}</p> : null}
              {filteredFiles.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{t("empty")}</div> : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
                      <button type="button" onClick={() => setPreviewFile(file)} className="block aspect-video w-full bg-slate-900">
                        {file.file_type?.startsWith("image") || file.file_url.includes("dicebear") ? <img src={file.file_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Preview unavailable</div>}
                      </button>
                      <div className="space-y-2 p-4">
                        <p className="break-words font-medium">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">{file.file_type ?? "file"} / {formatSize(file.file_size)} / {formatDate(file.created_at)}</p>
                        <p className="break-words text-sm text-muted-foreground">{file.note}</p>
                        <div className="grid gap-2 min-[430px]:grid-cols-2">
                          <Button size="sm" variant="outline" onClick={() => setPreviewFile(file)}><Eye className="h-4 w-4" /> Preview</Button>
                          <Button size="sm" variant="outline" onClick={() => copyUrl(file)}>{copiedId === file.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copiedId === file.id ? "Copied" : "URL"}</Button>
                          <Button size="sm" variant="destructive" className="min-[430px]:col-span-2" onClick={() => deleteFile(file.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {previewFile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4" onClick={() => setPreviewFile(null)}>
          <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 sm:p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3"><p className="min-w-0 break-words font-semibold">{previewFile.file_name}</p><Button variant="outline" onClick={() => setPreviewFile(null)}>Close</Button></div>
            <img src={previewFile.file_url} alt="" className="max-h-[75vh] w-full rounded-lg object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

