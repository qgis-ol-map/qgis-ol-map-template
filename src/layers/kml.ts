import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import KML from "ol/format/KML.js";
import type { CommonLayerJson, CommonVectorLayerJson } from ".";
import { makeStyleFunction } from "./styles/vector-feature";
import { wrapSourceWithClustering } from "./clustering/cluster";
import { makePopupProps } from "../controls/popup-controller/PopUpController";

export type KmlLayerJson = CommonLayerJson &
  CommonVectorLayerJson & {
    url: string;
  };

export const kmlLayerFromJson = async (json: KmlLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new KML(),
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
    properties: {
      ...makePopupProps(json),
    },
    ...json.layerParams,
  });
};
