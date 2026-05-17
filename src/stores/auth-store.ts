"use client";

import { create } from "zustand";
import type { Profile, Subscription } from "@/types/database";

interface AuthState {
  user: Profile | null;
  subscription: Subscription | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setLoading: (loading: boolean) => void;
  hydrate: (data: { user: Profile | null; subscription: Subscription | null }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscription: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (isLoading) => set({ isLoading }),
  hydrate: (data) => set({ ...data, isLoading: false }),
}));
