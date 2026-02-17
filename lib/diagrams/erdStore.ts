import { create } from "zustand";
import type { ErdNotation } from "@/lib/diagrams/erd";

type ErdSettingsState = {
  notation: ErdNotation;
  setNotation: (n: ErdNotation) => void;
};

export const useErdSettingsStore = create<ErdSettingsState>((set) => ({
  notation: "crows_foot",
  setNotation: (notation) => set({ notation }),
}));

