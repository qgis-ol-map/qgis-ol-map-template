import TileLayer from "ol/layer/Tile";
import { TileWMS } from "ol/source";
import type { WmsLayerJson } from "./wms";

export const wmsTilesLayerFromJson = async (json: WmsLayerJson) => {
  const source = new TileWMS({
    url: json.url,
    attributions: json.attribution,
    params: { LAYERS: json.layer },
    serverType: "geoserver",
    transition: 0,
    ...json.sourceParams,
  });

  return new TileLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
    ...json.layerParams,
  });
};
