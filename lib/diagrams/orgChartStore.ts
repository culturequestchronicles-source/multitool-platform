import { create } from "zustand";

export type OrgChartType = "functional" | "divisional" | "matrix" | "flat";

export type OrgChartSettings = {
  chartType: OrgChartType;
  showLegend: boolean;
  setChartType: (t: OrgChartType) => void;
  toggleLegend: () => void;
};

export const useOrgChartSettingsStore = create<OrgChartSettings>((set) => ({
  chartType: "functional",
  showLegend: true,
  setChartType: (chartType) => set({ chartType }),
  toggleLegend: () => set((s) => ({ showLegend: !s.showLegend })),
}));

