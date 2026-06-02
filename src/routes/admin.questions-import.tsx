import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Upload, FileText, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { toast } from "sonner";
import { quizService } from "@/services/api";
import { adminService } from "@/services/admin";
import { SkeletonBlock, toastApiError } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/questions-import")({
  component: QuestionsImportPage,
});

type LogLine = { type: "info" | "success" | "error"; msg: string; at: string };

function QuestionsImportPage() {
  const qc = useQueryClient();
  const langs = useQuery({ queryKey: ["quiz", "languages"], queryFn: () => quizService.getLanguages(), retry: 0 });
  const status = useQuery({ queryKey: ["admin", "questions-status"], queryFn: () => adminService.getQuestionsImportStatus(), retry: 0 });

  const [language, setLanguage] = useState("");
  const [filePath, setFilePath] = useState("");
  const [json, setJson] = useState("");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const log = (l: Omit<LogLine, "at">) => setLogs((p) => [{ ...l, at: new Date().toLocaleTimeString() }, ...p].slice(0, 100));

  const localValidation = useMemo(() => {
    if (!json.trim()) return null;
    try {
      const parsed = JSON.parse(json);
      const arr = Array.isArray(parsed) ? parsed : parsed.questions ?? [];
      return { valid: true, total: arr.length, sample: arr[0] };
    } catch (e: any) {
      return { valid: false, error: e?.message };
    }
  }, [json]);

  const m = useMutation({
    mutationFn: () => adminService.importQuestions({ file_path: filePath, language }),
    onMutate: () => log({ type: "info", msg: `Importing ${filePath} (${language})` }),
    onSuccess: (r) => {
      const d = r.data;
      log({ type: "success", msg: `${d?.message ?? "Imported"} — ${d?.questions_imported ?? 0} questions` });
      toast.success("Questions imported");
      qc.invalidateQueries({ queryKey: ["admin", "questions-status"] });
    },
    onError: (e: any) => { log({ type: "error", msg: e?.message || "Failed" }); toast.error(e?.message || "Failed"); },
  });

  const s = status.data?.data;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Questions Import</h2>
        <p className="text-sm text-muted-foreground">Import a questions JSON file by language.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total questions" value={s?.total_questions ?? 0} />
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:col-span-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Database className="h-3.5 w-3.5" />By language</div>
          <div className="mt-1 grid grid-cols-2 gap-x-6 text-xs sm:grid-cols-4">
            {Object.entries(s?.questions_by_language ?? {}).map(([k, v]) => (
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
              <option value="">Select</option>
              {(langs.data?.data ?? []).map((l) => <option key={l.language_id} value={l.code}>{l.name}</option>)}
            </select>
          </Field>
          <Field label="File path">
            <input
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="en_ge_q.json"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
          </Field>
          <Field label="Paste JSON (client-side preview only)">
            <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={6} className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs" placeholder='{"questions":[{"question_text":"...","book_id":1,"chapter":1,"verse":1,"options":["A","B","C","D"],"correct_answer":0}]}' />
          </Field>
          <button type="submit" disabled={m.isPending} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import file
          </button>
        </form>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 font-serif text-lg font-semibold">Preview</h3>
            {!localValidation ? (
              <p className="text-sm text-muted-foreground">Paste JSON to preview.</p>
            ) : !localValidation.valid ? (
              <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>Invalid JSON{localValidation.error ? `: ${localValidation.error}` : ""}</span>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-4 w-4" />Valid JSON — {localValidation.total} questions</div>
                {localValidation.sample && (
                  <div className="rounded-md border border-border bg-secondary/40 p-3">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">Sample</div>
                    <pre className="overflow-x-auto text-xs">{JSON.stringify(localValidation.sample, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-serif text-lg font-semibold">Log</h3>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto text-xs">
                {logs.map((l, i) => (
                  <li key={i} className={`flex gap-2 rounded border px-2 py-1.5 ${
                    l.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : l.type === "error" ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-border bg-secondary/40"
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
