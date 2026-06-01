import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Search, Download, Eye, Power, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { adminService, type AdminUser } from "@/services/admin";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [viewing, setViewing] = useState<AdminUser | null>(null);

  const q = useQuery({
    queryKey: ["admin", "users", { page }],
    queryFn: () => adminService.listUsers({ limit, offset: (page - 1) * limit }),
    retry: 0,
  });

  const allUsers = q.data?.data?.users ?? [];
  const total = q.data?.data?.total ?? 0;

  const users = useMemo(() => {
    return allUsers.filter((u) => {
      if (status === "active" && !u.is_active) return false;
      if (status === "inactive" && u.is_active) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!u.username.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [allUsers, search, status]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const toggleActive = useMutation({
    mutationFn: (u: AdminUser) => adminService.setUserActive(u.id, !u.is_active),
    onSuccess: () => { toast.success("User updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: any) => toast.error(e?.message || "Failed to update"),
  });

  const toggleAdmin = useMutation({
    mutationFn: (u: AdminUser) => adminService.setUserAdmin(u.id, !u.is_admin),
    onSuccess: () => { toast.success("Admin status updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e: any) => toast.error(e?.message || "Failed to update"),
  });

  const exportCsv = () => {
    const rows = [["ID", "Username", "Email", "Joined", "Quizzes", "Admin", "Status"]];
    users.forEach((u) =>
      rows.push([
        String(u.id), u.username, u.email,
        new Date(u.created_at).toISOString(),
        String(u.total_quizzes_taken ?? 0),
        u.is_admin ? "yes" : "no",
        u.is_active ? "active" : "inactive",
      ]),
    );
    const csv = rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users.csv";
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or email"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Quizzes</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {q.isLoading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : q.isError ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Couldn't load users.</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 text-muted-foreground">#{u.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{u.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.total_quizzes_taken ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${u.is_admin ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                      {u.is_admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={u.is_active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewing(u)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary" aria-label="View"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => toggleAdmin.mutate(u)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary" aria-label="Toggle admin" title={u.is_admin ? "Demote" : "Promote to admin"}>
                        {u.is_admin ? <ShieldOff className="h-4 w-4 text-purple-600" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      <button onClick={() => toggleActive.mutate(u)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary" aria-label="Toggle active"><Power className={`h-4 w-4 ${u.is_active ? "text-emerald-600" : "text-muted-foreground"}`} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50">Prev</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
        </div>
      )}

      {viewing && <ViewUserModal user={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
      active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
    }`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ViewUserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const progress = useQuery({
    queryKey: ["admin", "user-progress", user.id],
    queryFn: () => adminService.getUserProgress(user.id),
    retry: 0,
  });
  const attempts = progress.data?.data?.quiz_attempts ?? [];
  return (
    <ModalShell title={user.username} onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary/50 p-3">
          <Info label="Email" value={user.email} />
          <Info label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
          <Info label="Quizzes" value={String(user.total_quizzes_taken ?? 0)} />
          <Info label="Status" value={user.is_active ? "Active" : "Inactive"} />
          <Info label="Correct" value={String(user.total_correct_answers ?? 0)} />
          <Info label="Answered" value={String(user.total_questions_answered ?? 0)} />
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quiz attempts</h4>
          {progress.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : attempts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attempts.</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {attempts.map((h) => (
                <li key={h.id} className="flex justify-between rounded border border-border px-2 py-1 text-xs">
                  <span>{h.book_name}</span>
                  <span className="text-muted-foreground">{h.score}% ({h.correct_answers}/{h.questions_count})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
