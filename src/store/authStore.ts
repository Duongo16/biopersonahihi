import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "business" | "user";
  apiKey?: string;
  businessId?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

export default useAuthStore;
