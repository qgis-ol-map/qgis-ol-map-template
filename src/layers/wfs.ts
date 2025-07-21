import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import WFS from "ol/format/WFS.js";
import type { CommonLayerJson } from ".";

export type WfsLayerJson = CommonLayerJson & {
  url: string;
  layer: string;
  version?: string;
  crs?: string;
};

export const wfsLayerFromJson = async (json: WfsLayerJson) => {
  const source = new VectorSource({
    format: new WFS({ version: "1.1.0" }),
    url:
      json.url +
      `?SERVICE=WFS&REQUEST=GetFeature&TYPENAMES=${json.layer}&VERSION=${json.version}&srsname=${json.crs}`,
  });

  return new VectorLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
  });
};
