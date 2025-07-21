import { kmlLayerFromJson, type KmlLayerJson } from "./kml";
import { xyzLayerFromJson, type XyzLayerJson } from "./xyz";
import { wmsLayerFromJson, type WmsLayerJson } from "./wms";
import { wmtsLayerFromJson, type WmtsLayerJson } from "./wmts";
import { groupLayerFromJson, type GroupLayerJson } from "./group";
import { wfsLayerFromJson, type WfsLayerJson } from "./wfs";
import { gpsLayerFromJson, type GpsLayerJson } from "./gps";
import { geoJsonLayerFromJson, type GeoJsonLayerJson } from "./geojson";
import { wmsTilesLayerFromJson } from "./wms-tiles";

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

export type LayerJson =
  | KmlLayerJson
  | GeoJsonLayerJson
  | XyzLayerJson
  | WmsLayerJson
  | WmtsLayerJson
  | GpsLayerJson
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
  if (json.type === "gps") {
    return gpsLayerFromJson(json as GpsLayerJson);
  }
  console.error("Unknown layer type: " + json.type, json);
  return null;
};
