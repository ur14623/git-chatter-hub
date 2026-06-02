import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Upload, FileText, Database } from "lucide-react";
import { toast } from "sonner";
import { quizService } from "@/services/api";
import { adminService } from "@/services/admin";
import { SkeletonBlock, toastApiError } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/bible-import")({
  component: BibleImportPage,
});

type LogLine = { type: "info" | "success" | "error"; msg: string; at: string };

function BibleImportPage() {
  const qc = useQueryClient();
  const langs = useQuery({ queryKey: ["quiz", "languages"], queryFn: () => quizService.getLanguages(), retry: 0 });
  const status = useQuery({ queryKey: ["admin", "bible-status"], queryFn: () => adminService.getBibleImportStatus(), retry: 0 });

  const [language, setLanguage] = useState("");
  const [filePath, setFilePath] = useState("");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const log = (l: Omit<LogLine, "at">) => setLogs((p) => [{ ...l, at: new Date().toLocaleTimeString() }, ...p].slice(0, 100));

  const m = useMutation({
    mutationFn: () => adminService.importBible({ language, file_path: filePath }),
    onMutate: () => log({ type: "info", msg: `Importing ${filePath} (${language})` }),
    onSuccess: (r) => {
      const d = r.data;
      log({ type: "success", msg: `${d?.message ?? "Imported"} — ${d?.book_name ?? ""} (${d?.verses_imported ?? 0} verses)` });
      toast.success("Bible imported");
      qc.invalidateQueries({ queryKey: ["admin", "bible-status"] });
    },
    onError: (e: any) => { log({ type: "error", msg: e?.message || "Failed" }); toast.error(e?.message || "Failed"); },
  });

  const s = status.data?.data;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Bible Import</h2>
        <p className="text-sm text-muted-foreground">Import a Bible book file by language.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Books imported" value={s?.books_imported ?? 0} />
        <Stat label="Verses imported" value={s?.verses_imported ?? 0} />
        <Stat label="Languages" value={s?.languages_available?.length ?? 0} />
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Database className="h-3.5 w-3.5" />By language</div>
          <div className="mt-1 space-y-0.5 text-xs">
            {Object.entries(s?.verse_texts_by_language ?? {}).map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="font-mono">{k}</span><span className="text-muted-foreground">{v}</span></div>
            ))}
            {!s && <span className="text-muted-foreground">—</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); if (!language || !filePath) return; m.mutate(); }} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Field label="Language">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
              <option value="">Select language</option>
              {(langs.data?.data ?? []).map((l) => <option key={l.language_id} value={l.code}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="File path">
            <input
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="bibel_txt/new/en/genesis.txt"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </Field>
          <button type="submit" disabled={m.isPending} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import file
          </button>
        </form>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-serif text-lg font-semibold">Log</h3>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="max-h-96 space-y-1 overflow-y-auto text-xs">
              {logs.map((l, i) => (
                <li key={i} className={`flex gap-2 rounded border px-2 py-1.5 ${
                  l.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : l.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-border bg-secondary/40 text-foreground"
                }`}>
                  <span className="text-muted-foreground">{l.at}</span>
                  <span>{l.msg}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
