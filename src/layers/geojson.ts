import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import type { CommonLayerJson, CommonVectorLayerJson } from ".";
import { makeStyleFunction } from "./styles/vector-feature";
import { wrapSourceWithClustering } from "./clustering/cluster";

export type GeoJsonLayerJson = CommonLayerJson &
  CommonVectorLayerJson & {
    url: string;
    crs?: string;
  };

export const geoJsonLayerFromJson = async (json: GeoJsonLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new GeoJSON({ dataProjection: json.crs }),
    attributions: json.attribution,
    ...json.sourceParams,
  });

  const styleFunction = makeStyleFunction(json.style);

  return new VectorLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source: wrapSourceWithClustering(source, json.clustering),
    style: styleFunction,
    ...json.layerParams,
  });
};
