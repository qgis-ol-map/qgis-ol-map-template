import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import type { CommonLayerJson } from ".";

export type GeoJsonLayerJson = CommonLayerJson & {
  url: string;
};

export const geoJsonLayerFromJson = async (json: GeoJsonLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new GeoJSON(),
    attributions: json.attribution ?? "",
  });
  return new VectorLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
  });
};
