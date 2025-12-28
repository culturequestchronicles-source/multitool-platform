export type DiagramTheme = {
    id: string;
    name: string;
    canvasBg: string;
    gridDot: string;
    nodeBg: string;
    nodeBorder: string;
    text: string;
    accent: string;
    muted: string;
  };
  
  export const THEMES: DiagramTheme[] = [
    {
      id: "midnight",
      name: "Midnight Pro",
      canvasBg: "#0b1220",
      gridDot: "rgba(255,255,255,0.10)",
      nodeBg: "#0f172a",
      nodeBorder: "#334155",
      text: "#e5e7eb",
      accent: "#60a5fa",
      muted: "#94a3b8",
    },
    {
      id: "paper",
      name: "Paper Clean",
      canvasBg: "#ffffff",
      gridDot: "rgba(15,23,42,0.10)",
      nodeBg: "#ffffff",
      nodeBorder: "#0f172a",
      text: "#0f172a",
      accent: "#2563eb",
      muted: "#64748b",
    },
    {
      id: "aurora",
      name: "Aurora",
      canvasBg: "#071a16",
      gridDot: "rgba(236,254,255,0.12)",
      nodeBg: "#052e2b",
      nodeBorder: "#0f766e",
      text: "#e6fffb",
      accent: "#2dd4bf",
      muted: "#99f6e4",
    },
  ];
  