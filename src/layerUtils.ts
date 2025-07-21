import ImageTileSource from "ol/source/ImageTile.js";
import TileLayer from "ol/layer/tile";
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

type KmlLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
};

type XyzLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
};

type WmsLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
  layer: string;
};

type WmtsLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
  layer: string;
};

type GroupLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  layers: Array<KmlLayerJson | XyzLayerJson | WmsLayerJson | WmtsLayerJson>;
};

type WfsLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  layer: string;
  version?: string;
  crs?: string;
};

export const layerFromJson = async (json: any) => {
  if (json.type === "xyz") {
    return xyzLayerFromJson(json as XyzLayerJson);
  }
  if (json.type === "wms") {
    return wmsLayerFromJson(json as WmsLayerJson);
  }
  if (json.type === "wms-tiles") {
    return wmsTilesLayerFromJson(json as WmsLayerJson);
  }
  if (json.type === "wmts") {
    return wmtsLayerFromJson(json as WmtsLayerJson);
  }
  if (json.type === "wfs") {
    return wfsLayerFromJson(json as WfsLayerJson);
  }
  if (json.type === "kml") {
    return kmlLayerFromJson(json as KmlLayerJson);
  }
  if (json.type === "group") {
    return groupLayerFromJson(json as GroupLayerJson);
  }
  console.error("Unknown layer type");
  return null;
};

const xyzLayerFromJson = async (json: XyzLayerJson) => {
  const source = new ImageTileSource({
    url: json.url,
    attributions: json.attribution ?? "",
  });

  return new TileLayer({
    title: json.title ?? "Untitled XYZ layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};

const wmsLayerFromJson = async (json: WmsLayerJson) => {
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

const wmsTilesLayerFromJson = async (json: WmsLayerJson) => {
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

const wmtsLayerFromJson = async (json: WmtsLayerJson) => {
  const capabilitiesUrlParams = "?Service=WMTS&Request=GetCapabilities";
  const capabilitiesResponse = await fetch(
    `${json.url}${capabilitiesUrlParams}`
  );
  const capabilitiesText = await capabilitiesResponse.text();
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(capabilitiesText);
  const options = optionsFromCapabilities(capabilities, {
    layer: json.layer,
    attributions: json.attribution ?? "",
  });

  if (!options) {
    console.error("Cannot get options from WMTS capabilities");
    return null;
  }

  const source = new WMTS(options);

  return new TileLayer({
    title: json.title ?? "Untitled WMTS layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};

const kmlLayerFromJson = async (json: KmlLayerJson) => {
  const source = new VectorSource({
    url: json.url,
    format: new KML(),
    attributions: json.attribution ?? "",
  });
  return new VectorLayer({
    title: json.title ?? "Untitled KML layer",
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    source,
  });
};

const groupLayerFromJson = async (json: GroupLayerJson) => {
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

const wfsLayerFromJson = async (json: WfsLayerJson) => {
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
