import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { adminService, type AdminBook } from "@/services/admin";
import { ConfirmModal } from "./admin.languages";
import { SkeletonRows, toastApiError } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/books")({
  component: BooksPage,
});

function BooksPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"all" | "Old" | "New">("all");
  const [editing, setEditing] = useState<Partial<AdminBook> | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminBook | null>(null);

  const q = useQuery({
    queryKey: ["admin", "books", { testament }],
    queryFn: () => adminService.listBooks({ testament }),
    retry: 0,
  });

  const all = q.data?.data ?? [];
  const books = useMemo(
    () => (search ? all.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())) : all),
    [all, search]
  );

  const del = useMutation({
    mutationFn: (id: number) => adminService.deleteBook(id),
    onSuccess: () => { toast.success("Book deleted"); qc.invalidateQueries({ queryKey: ["admin", "books"] }); setConfirmDel(null); },
    onError: (e) => toastApiError(e, "Failed to delete book"),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold text-foreground">Books</h2>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add book
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search book by name"
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select value={testament} onChange={(e) => setTestament(e.target.value as any)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All testaments</option>
          <option value="Old">Old</option>
          <option value="New">New</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Testament</th>
              <th className="px-4 py-3">Chapters</th>
              <th className="px-4 py-3">Verses</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {q.isLoading ? (
              <SkeletonRows cols={6} rows={6} />
            ) : q.isError ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">{(q.error as any)?.message || "Couldn't load books."}</td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No books.</td></tr>
            ) : books.map((b) => (
              <tr key={b.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.testament}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.chapters}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.verses}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditing(b)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setConfirmDel(b)} className="grid h-8 w-8 place-items-center rounded-md hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <BookModal initial={editing} onClose={() => setEditing(null)} onSaved={() => qc.invalidateQueries({ queryKey: ["admin", "books"] })} />}
      {confirmDel && <ConfirmModal title="Delete book?" message={`This will delete "${confirmDel.name}".`} onCancel={() => setConfirmDel(null)} onConfirm={() => del.mutate(confirmDel.id)} loading={del.isPending} />}
    </div>
  );
}

function BookModal({ initial, onClose, onSaved }: { initial: Partial<AdminBook>; onClose: () => void; onSaved: () => void }) {
  const editing = !!initial.id;
  const [form, setForm] = useState({
    name: initial.name ?? "",
    testament: (initial.testament ?? "Old") as "Old" | "New",
  });
  const m = useMutation({
    mutationFn: async () => {
      if (editing) return adminService.updateBook(initial.id!, form);
      return adminService.createBook(form);
    },
    onSuccess: () => { toast.success(editing ? "Updated" : "Created"); onSaved(); onClose(); },
    onError: (e) => toastApiError(e, "Failed to save book"),
  });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md space-y-3 rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h3 className="font-serif text-lg font-semibold">{editing ? "Edit" : "Add"} book</h3>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Testament</label>
          <select value={form.testament} onChange={(e) => setForm({ ...form, testament: e.target.value as any })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="Old">Old</option>
            <option value="New">New</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-md border border-border py-2 text-sm">Cancel</button>
          <button disabled={m.isPending} type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Save
          </button>
        </div>
      </form>
    </div>
  );
}
