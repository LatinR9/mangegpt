"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/lib/types";

function toCsv(rows: Transaction[], excelCompatible: boolean) {
  const header: (keyof Transaction)[] = ["type", "amount", "category", "app_id", "group_id", "customer_id", "date", "note", "slip_url", "color"];
  const body = rows.map((row) => header.map((key) => {
    const value = String(row[key] ?? "");
    return `"${value.replaceAll('"', '""')}"`;
  }).join(","));
  const csv = [header.join(","), ...body].join("\n");
  return excelCompatible ? `\uFEFF${csv}` : csv;
}

function downloadCsv(rows: Transaction[], excelCompatible: boolean) {
  const blob = new Blob([toCsv(rows, excelCompatible)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = excelCompatible ? "subgroup-transactions-excel.csv" : "subgroup-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ rows }: { rows: Transaction[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" onClick={() => downloadCsv(rows, false)}><Download className="h-4 w-4" /> Export CSV</Button>
      <Button type="button" variant="outline" onClick={() => downloadCsv(rows, true)}><Download className="h-4 w-4" /> Export Excel-compatible CSV</Button>
    </div>
  );
}
