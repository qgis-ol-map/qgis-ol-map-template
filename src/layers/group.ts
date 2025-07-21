import ImageTileSource from "ol/source/ImageTile.js";
import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS.js";
import ImageLayer from "ol/layer/Image";
import { ImageWMS, TileWMS } from "ol/source";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import KML from "ol/format/KML.js";
import LayerGroup from "ol/layer/Group";
import type Layer from "ol/layer/Layer";
import WFS from "ol/format/WFS.js";
import Feature from "ol/Feature.js";
import Geolocation from "ol/Geolocation.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Point from "ol/geom/Point.js";
import { layerFromJson } from ".";



export type GroupLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  layers: Array<JsonLayer>;
};



export const groupLayerFromJson = async (json: GroupLayerJson) => {
  const layers: Array<Layer> = [];
  for (const layerJsonId in json.layers) {
    const layerJson = json.layers[layerJsonId];
    const layer = await layerFromJson(layerJson);
    if (!layer) continue;
    layers.push(layer);
  }
  const group = new LayerGroup({
    title: json.title ?? "Untitled Group",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    layers,
  });
  return group;
};