import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import WFS from "ol/format/WFS.js";
import type { CommonLayerJson } from ".";
import {
  makeStyleFunction,
  type VectorFeatureStyleJson,
} from "./styles/vector-feature";

export type WfsLayerJson = CommonLayerJson & {
  url: string;
  layer: string;
  version?: string;
  crs?: string;
  style?: VectorFeatureStyleJson;
};

export const wfsLayerFromJson = async (json: WfsLayerJson) => {
  const source = new VectorSource({
    format: new WFS({ version: "1.1.0" }),
    attributions: json.attribution,
    url:
      json.url +
      `?SERVICE=WFS&REQUEST=GetFeature&TYPENAMES=${json.layer}&VERSION=${json.version}&srsname=${json.crs}`,
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
