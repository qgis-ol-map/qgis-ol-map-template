import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import KML from "ol/format/KML.js";

export type KmlLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
};

export const kmlLayerFromJson = async (json: KmlLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new KML(),
    attributions: json.attribution ?? "",
  });
  return new VectorLayer({
    title: json.title ?? "Untitled KML layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};
