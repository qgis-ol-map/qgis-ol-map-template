import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import { ImageWMS, TileWMS } from "ol/source";

export type WmsLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
  layer: string;
};

export const wmsLayerFromJson = async (json: WmsLayerJson) => {
  const source = new ImageWMS({
    url: json.url,
    attributions: json.attribution ?? "",
    params: { LAYERS: json.layer },
    ratio: 1,
    serverType: "geoserver",
  });

  return new ImageLayer({
    title: json.title ?? "Untitled WMS layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};


export const wmsTilesLayerFromJson = async (json: WmsLayerJson) => {
  const source = new TileWMS({
    url: json.url,
    attributions: json.attribution ?? "",
    params: { LAYERS: json.layer },
    serverType: "geoserver",
    transition: 0,
  });

  return new TileLayer({
    title: json.title ?? "Untitled tiled WMS layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};
