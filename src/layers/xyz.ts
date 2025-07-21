import ImageTileSource from "ol/source/ImageTile.js";
import TileLayer from "ol/layer/Tile";
import type { CommonLayerJson } from ".";

export type XyzLayerJson = CommonLayerJson & {
  url: string;
};

export const xyzLayerFromJson = async (json: XyzLayerJson) => {
  const source = new ImageTileSource({
    url: json.url,
    attributions: json.attribution ?? "",
  });

  return new TileLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
  });
};
