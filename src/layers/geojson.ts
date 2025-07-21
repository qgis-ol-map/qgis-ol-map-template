import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import type { CommonLayerJson } from ".";
import { makeStyleFunction, type VectorFeatureStyleJson } from "./styles/vector-feature";

export type GeoJsonLayerJson = CommonLayerJson & {
  url: string;
  style?: VectorFeatureStyleJson;
};

export const geoJsonLayerFromJson = async (json: GeoJsonLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new GeoJSON(),
    attributions: json.attribution,
    ...json.sourceParams,
  });

  const styleFunction = makeStyleFunction(json.style);

  return new VectorLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
    style: styleFunction,
    ...json.layerParams,
  });
};
