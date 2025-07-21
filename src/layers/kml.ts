import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import KML from "ol/format/KML.js";
import type { CommonLayerJson } from ".";

export type KmlLayerJson = CommonLayerJson & {
  url: string;
};

export const kmlLayerFromJson = async (json: KmlLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new KML(),
    attributions: json.attribution ?? "",
  });
  return new VectorLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
  });
};
