/** Shared domain types mirroring the backend API contract. */
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilter = 'all' | 'active' | 'completed';

export interface TodoListResponse {
  todos: Todo[];
  activeCount: number;
}
