export type SiteAssetId = "tower" | "shelter" | "rectifier" | "battery" | "generator" | "camera";

export type AssetState = "ok" | "warning" | "fault" | "unknown";

export const ASSET_LABEL: Record<SiteAssetId, string> = {
  tower: "Torre / RAN",
  shelter: "Shelter / Ambiente",
  rectifier: "Grupo rectificador",
  battery: "Grupo de baterias",
  generator: "Gerador / ATS",
  camera: "Câmara",
};
