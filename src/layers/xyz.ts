import ImageTileSource from "ol/source/ImageTile.js";
import TileLayer from "ol/layer/Tile";

export type XyzLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
};

export const xyzLayerFromJson = async (json: XyzLayerJson) => {
  const source = new ImageTileSource({
    url: json.url,
    attributions: json.attribution ?? "",
  });

  return new TileLayer({
    title: json.title ?? "Untitled XYZ layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};
