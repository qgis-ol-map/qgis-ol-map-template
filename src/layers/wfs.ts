import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import WFS from "ol/format/WFS.js";
import type { CommonLayerJson, CommonVectorLayerJson } from ".";
import { makeStyleFunction } from "./styles/vector-feature";
import { wrapSourceWithClustering } from "./clustering/cluster";
import { makePopupProps } from "../controls/popup-controller/PopUpController";

export type WfsLayerJson = CommonLayerJson &
  CommonVectorLayerJson & {
    url: string;
    layer: string;
    version?: string;
  };

// it looks like there is no support for reprojection in wfs format,
// so we force EPSG:4326 on the remote source
const crs = "EPSG:4326";

export const wfsLayerFromJson = async (json: WfsLayerJson) => {
  const source = new VectorSource({
    format: new WFS({ version: "1.1.0" }),
    attributions: json.attribution,
    url:
      json.url +
      `?SERVICE=WFS&REQUEST=GetFeature&TYPENAMES=${json.layer}&VERSION=${json.version}&SRSNAME=${crs}`,
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
