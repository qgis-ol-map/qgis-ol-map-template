import { kmlLayerFromJson, type KmlLayerJson } from "./kml";
import { xyzLayerFromJson, type XyzLayerJson } from "./xyz";
import { wmsLayerFromJson, type WmsLayerJson } from "./wms";
import { wmtsLayerFromJson, type WmtsLayerJson } from "./wmts";
import { groupLayerFromJson, type GroupLayerJson } from "./group";
import { wfsLayerFromJson, type WfsLayerJson } from "./wfs";
import { geoJsonLayerFromJson, type GeoJsonLayerJson } from "./geojson";
import { wmsTilesLayerFromJson } from "./wms-tiles";
import type { VectorFeatureStyleJson } from "./styles/vector-feature";
import type { ClusteringConfigJson } from "./clustering/cluster";
import type Layer from "ol/layer/Layer";
import type { FeatureLike } from "ol/Feature";

export type PopupFunction = (
  element: HTMLElement,
  feature: FeatureLike,
  layer: Layer
) => (() => void) | null;

export type CommonLayerJson = {
  type: string;
  title?: string;
  visible?: boolean;
  index: number;
  zIndex: number;
  opacity?: number;
  attribution?: string;
  sourceParams?: Record<string, any>;
  layerParams?: Record<string, any>;
};

export type CommonVectorLayerJson = {
  style?: VectorFeatureStyleJson;
  clustering?: ClusteringConfigJson;
  popup?: PopupFunction;
};

export type LayerJson =
  | KmlLayerJson
  | GeoJsonLayerJson
  | XyzLayerJson
  | WmsLayerJson
  | WmtsLayerJson
  | GroupLayerJson
  | WfsLayerJson;

export const layerFromJson = async (json: any, layerUid: string) => {
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
  if (json.type === "geojson") {
    return geoJsonLayerFromJson(json as GeoJsonLayerJson);
  }
  if (json.type === "group") {
    return groupLayerFromJson(json as GroupLayerJson, layerUid);
  }
  console.error("Unknown layer type: " + json.type, json);
  return null;
};
