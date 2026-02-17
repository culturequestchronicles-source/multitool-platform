import { create } from "zustand";

export type FlowchartLayoutDirection = "TB" | "LR";

type FlowchartSettings = {
  direction: FlowchartLayoutDirection;
  showLegend: boolean;
  toggleLegend: () => void;
  setDirection: (d: FlowchartLayoutDirection) => void;
};

export const useFlowchartSettingsStore = create<FlowchartSettings>((set) => ({
  direction: "TB",
  showLegend: true,
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
  setDirection: (direction) => set({ direction }),
}));

