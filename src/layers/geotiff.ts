import type { CommonLayerJson } from ".";
import GeoTIFF from "ol/source/GeoTIFF.js";
import TileLayer from "ol/layer/WebGLTile.js";

export type GeoTiffLayerJson = CommonLayerJson & {
  url: string;
  crs?: string;
};

export const geoTiffLayerFromJson = async (json: GeoTiffLayerJson) => {
  const source = new GeoTIFF({
    sources: [
      {
        url: json.url,
        ...json.sourceParams,
      },
    ],
  });

  return new TileLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source: source,
    ...json.layerParams,
  });
};
