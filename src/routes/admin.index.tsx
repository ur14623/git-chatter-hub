import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Globe, BookOpen, FileQuestion, Loader2, Trophy, CheckCircle2 } from "lucide-react";
import { adminService } from "@/services/admin";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery({ queryKey: ["admin", "user-stats"], queryFn: () => adminService.getUserStats(), retry: 0 });
  const books = useQuery({ queryKey: ["admin", "books-count"], queryFn: () => adminService.listBooks(), retry: 0 });
  const langs = useQuery({ queryKey: ["admin", "langs-count"], queryFn: () => adminService.listLanguages(), retry: 0 });

  const s = stats.data?.data;
  const cards = [
    { label: "Total Users", value: s?.total_users, icon: Users, to: "/admin/users", color: "text-blue-600" },
    { label: "Total Languages", value: langs.data?.data?.length, icon: Globe, to: "/admin/languages", color: "text-emerald-600" },
    { label: "Total Books", value: books.data?.data?.length, icon: BookOpen, to: "/admin/books", color: "text-amber-600" },
    { label: "Total Questions", value: s?.total_questions, icon: FileQuestion, to: "/admin/questions-import", color: "text-rose-600" },
    { label: "Total Quizzes Taken", value: s?.total_quizzes, icon: Trophy, to: "/admin/users", color: "text-purple-600" },
    { label: "Total Correct Answers", value: s?.total_correct, icon: CheckCircle2, to: "/admin/users", color: "text-teal-600" },
  ] as const;

  const loading = stats.isLoading || books.isLoading || langs.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of your platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div className="mt-3 text-3xl font-semibold text-foreground">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : (c.value ?? 0)}
              </div>
            </Link>
          );
        })}
      </div>

      {s && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">Average</h3>
          <p className="text-sm text-muted-foreground">
            Average quizzes per user: <span className="font-medium text-foreground">{s.avg_quizzes_per_user.toFixed(2)}</span>
          </p>
        </div>
      )}
    </div>
  );
}
