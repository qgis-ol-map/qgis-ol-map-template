import ImageLayer from "ol/layer/Image";
import { ImageWMS } from "ol/source";
import type { CommonLayerJson } from ".";

export type WmsLayerJson = CommonLayerJson & {
  url: string;
  layer: string;
};

export const wmsLayerFromJson = async (json: WmsLayerJson) => {
  const source = new ImageWMS({
    url: json.url,
    attributions: json.attribution,
    params: { LAYERS: json.layer },
    ratio: 1,
    serverType: "geoserver",
    ...json.sourceParams,
  });

  return new ImageLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
    ...json.layerParams,
  });
};
