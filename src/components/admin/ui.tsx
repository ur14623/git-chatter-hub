import { toast } from "sonner";
import { formatApiError } from "@/services/api";

/** Show an inline error toast with the API's message/detail/errors. */
export function toastApiError(e: unknown, fallback = "Request failed") {
  toast.error(formatApiError(e, fallback));
}

/** Skeleton rows shown inside a table tbody while data loads. */
export function SkeletonRows({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse">
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-3.5 w-full max-w-[180px] rounded bg-muted/70" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Block-level skeleton, e.g. for cards / stat tiles. */
export function SkeletonBlock({ className = "h-6 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted/70 ${className}`} />;
}
