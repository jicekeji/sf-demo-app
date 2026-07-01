import { useMemo } from 'react';
import { TodoClient } from './api/client.js';
import { TodoApp } from './TodoApp.js';

export function App() {
  // Session is carried via cookies (credentials: 'include'); a dev token can be
  // supplied through VITE_DEV_TOKEN for local testing without a login flow.
  const client = useMemo(
    () => new TodoClient({ token: import.meta.env.VITE_DEV_TOKEN }),
    [],
  );
  return <TodoApp client={client} />;
}
