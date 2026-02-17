import { create } from "zustand";
import type { IconPackManifestV1, IconPackProvider } from "@/lib/diagrams/iconPacks";

type IconPackState = {
  manifests: Partial<Record<IconPackProvider, IconPackManifestV1 | null>>;
  setManifest: (provider: IconPackProvider, manifest: IconPackManifestV1 | null) => void;
};

export const useIconPackStore = create<IconPackState>((set) => ({
  manifests: {},
  setManifest: (provider, manifest) =>
    set((s) => ({
      manifests: { ...s.manifests, [provider]: manifest },
    })),
}));
