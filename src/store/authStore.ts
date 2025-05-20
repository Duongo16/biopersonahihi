import { create } from "zustand";

interface AuthState {
  user: { username: string; email: string; role: string } | null;
  setUser: (
    user: { username: string; email: string; role: string } | null
  ) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
