import { apiClient } from "./api";

/**
 * Admin service — matches the backend admin API spec.
 * Base path: /api/admin
 */

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login?: string | null;
  is_active: boolean;
  is_admin: boolean;
  total_quizzes_taken?: number;
  total_correct_answers?: number;
  total_questions_answered?: number;
};

export type AdminLanguage = {
  id: number;
  code: string;
  name: string;
  native_name: string | null;
  is_active: boolean;
  created_at?: string;
};

export type AdminBook = {
  id: number;
  name: string;
  testament: "Old" | "New";
  chapters: number;
  verses: number;
};

export type AdminUserStats = {
  total_users: number;
  total_quizzes: number;
  total_questions: number;
  total_correct: number;
  avg_quizzes_per_user: number;
};

export type AdminUserProgress = {
  quiz_attempts: Array<{
    id: number;
    book_name: string;
    questions_count: number;
    correct_answers: number;
    taken_at: string;
    score: number;
  }>;
  book_progress: Array<{
    book_id: number;
    book_name: string;
    total_questions: number;
    answered_correctly: number;
    progress: number;
  }>;
  total_quizzes: number;
  total_books_progress: number;
};

type Envelope<T> = { success: boolean; data: T; message?: string };

export const adminService = {
  // Users
  listUsers: (params: { limit?: number; offset?: number } = {}) => {
    const q = new URLSearchParams();
    q.set("limit", String(params.limit ?? 100));
    q.set("offset", String(params.offset ?? 0));
    return apiClient<Envelope<{ users: AdminUser[]; total: number; limit: number; offset: number }>>(
      `/api/admin/users?${q.toString()}`
    );
  },
  getUserStats: () =>
    apiClient<Envelope<AdminUserStats>>("/api/admin/users/stats"),
  getUser: (id: number) =>
    apiClient<Envelope<AdminUser>>(`/api/admin/users/${id}`),
  setUserActive: (id: number, is_active: boolean) =>
    apiClient<{ success: boolean; message: string }>(
      `/api/admin/users/${id}`,
      "PUT",
      { is_active }
    ),
  setUserAdmin: (id: number, is_admin: boolean) =>
    apiClient<{ success: boolean; message: string }>(
      `/api/admin/users/${id}/admin`,
      "PUT",
      { is_admin }
    ),
  getUserProgress: (id: number) =>
    apiClient<Envelope<AdminUserProgress>>(`/api/admin/users/${id}/progress`),

  // Books
  listBooks: (params: { testament?: "Old" | "New" | "all" } = {}) => {
    const q = new URLSearchParams();
    if (params.testament && params.testament !== "all") q.set("testament", params.testament);
    const qs = q.toString();
    return apiClient<Envelope<AdminBook[]>>(`/api/admin/books${qs ? `?${qs}` : ""}`);
  },
  getBook: (id: number) => apiClient<Envelope<AdminBook>>(`/api/admin/books/${id}`),
  createBook: (data: { name: string; testament: "Old" | "New" }) =>
    apiClient<Envelope<AdminBook>>("/api/admin/books", "POST", data),
  updateBook: (id: number, data: Partial<{ name: string; testament: "Old" | "New" }>) =>
    apiClient<{ success: boolean; message: string }>(`/api/admin/books/${id}`, "PUT", data),
  deleteBook: (id: number) =>
    apiClient<{ success: boolean; message: string }>(`/api/admin/books/${id}`, "DELETE"),

  // Languages
  listLanguages: () =>
    apiClient<Envelope<AdminLanguage[]>>("/api/admin/languages"),
  createLanguage: (data: { code: string; name: string; native_name?: string }) =>
    apiClient<Envelope<AdminLanguage>>("/api/admin/languages", "POST", data),
  updateLanguage: (
    id: number,
    data: Partial<{ name: string; native_name: string; is_active: boolean }>
  ) =>
    apiClient<{ success: boolean; message: string }>(
      `/api/admin/languages/${id}`,
      "PUT",
      data
    ),
  deleteLanguage: (id: number) =>
    apiClient<{ success: boolean; message: string }>(
      `/api/admin/languages/${id}`,
      "DELETE"
    ),

  // Bible import
  getBibleImportStatus: () =>
    apiClient<Envelope<{
      books_imported: number;
      verses_imported: number;
      verse_texts_by_language: Record<string, number>;
      languages_available: string[];
    }>>("/api/admin/import/bible"),
  importBible: (data: { file_path: string; language: string }) =>
    apiClient<Envelope<{
      success: boolean;
      message: string;
      book_name?: string;
      verses_imported?: number;
      language?: string;
    }>>("/api/admin/import/bible", "POST", data),

  // Questions import
  getQuestionsImportStatus: () =>
    apiClient<Envelope<{
      total_questions: number;
      questions_by_language: Record<string, number>;
    }>>("/api/admin/import/questions"),
  importQuestions: (data: { file_path: string; language: string }) =>
    apiClient<Envelope<{
      success: boolean;
      message: string;
      questions_imported?: number;
      language?: string;
    }>>("/api/admin/import/questions", "POST", data),
};
