import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS.js";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";

export type WmtsLayerJson = {
  type: string;
  title?: string;
  zIndex: number;
  opacity?: number;
  url: string;
  attribution?: string;
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
