import { create } from "zustand";

export type ArchitectureDirection = "LR" | "TB";
export type ArchitectureProvider = "generic" | "aws" | "azure" | "gcp" | "cncf";

type ArchitectureSettings = {
  direction: ArchitectureDirection;
  provider: ArchitectureProvider;
  showLegend: boolean;
  setDirection: (d: ArchitectureDirection) => void;
  setProvider: (p: ArchitectureProvider) => void;
  toggleLegend: () => void;
};

export const useArchitectureSettingsStore = create<ArchitectureSettings>((set) => ({
  direction: "LR",
  provider: "generic",
  showLegend: true,
  setDirection: (direction) => set({ direction }),
  setProvider: (provider) => set({ provider }),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
}));
