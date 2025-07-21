import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";

export type GeoJsonLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
};

export const geoJsonLayerFromJson = async (json: GeoJsonLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new GeoJSON(),
    attributions: json.attribution ?? "",
  });
  return new VectorLayer({
    title: json.title ?? "Untitled GeoJSON layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};
