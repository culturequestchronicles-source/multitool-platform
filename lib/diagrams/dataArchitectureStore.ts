import { create } from "zustand";
import type { DataArchitectureProvider } from "@/lib/diagrams/dataArchitecture";

export type DataArchitectureDirection = "LR" | "TB";

export type DataArchitectureSettings = {
  provider: DataArchitectureProvider;
  direction: DataArchitectureDirection;
  showLegend: boolean;
  setProvider: (p: DataArchitectureProvider) => void;
  setDirection: (d: DataArchitectureDirection) => void;
  toggleLegend: () => void;
};

export const useDataArchitectureStore = create<DataArchitectureSettings>((set) => ({
  provider: "generic",
  direction: "LR",
  showLegend: true,
  setProvider: (provider) => set({ provider }),
  setDirection: (direction) => set({ direction }),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
}));

