import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS.js";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";
import type { CommonLayerJson } from ".";

export type WmtsLayerJson = CommonLayerJson & {
  url: string;
  layer: string;
};

export const wmtsLayerFromJson = async (json: WmtsLayerJson) => {
  const capabilitiesUrlParams = "?Service=WMTS&Request=GetCapabilities";
  const capabilitiesResponse = await fetch(
    `${json.url}${capabilitiesUrlParams}`
  );
  const capabilitiesText = await capabilitiesResponse.text();
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(capabilitiesText);
  const options = optionsFromCapabilities(capabilities, {
    layer: json.layer,
    attributions: json.attribution,
    ...json.sourceParams,
  });

  if (!options) {
    console.error("Cannot get options from WMTS capabilities");
    return null;
  }

  const source = new WMTS(options);

  return new TileLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
    ...json.layerParams,
  });
};
