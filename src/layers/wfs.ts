import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import WFS from "ol/format/WFS.js";

export type WfsLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
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
    title: json.title ?? "Untitled WFS layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};
