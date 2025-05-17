import { create } from "zustand";

interface AuthState {
  user: { username: string; email: string } | null;
  setUser: (user: { username: string; email: string } | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
