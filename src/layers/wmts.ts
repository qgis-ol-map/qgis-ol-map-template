import TileLayer from "ol/layer/Tile";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS.js";
import WMTSCapabilities from "ol/format/WMTSCapabilities.js";
import type { CommonLayerJson } from ".";
import fetchRetry from "fetch-retry";

const fetchWithRetry = fetchRetry(fetch);

export type WmtsLayerJson = CommonLayerJson & {
  url: string;
  layer: string;
  init_reties?: number;
  init_retry_delay?: number;
};

const DEFAULT_INIT_RETRIES = 5;
const DEFAULT_INIT_RETRY_DELAY = 2000;

export const wmtsLayerFromJson = async (json: WmtsLayerJson) => {
  const capabilitiesUrlParams = "?Service=WMTS&Request=GetCapabilities";
  const capabilitiesResponse = await fetchWithRetry(
    `${json.url}${capabilitiesUrlParams}`,
    {
      retries: json.init_reties ?? DEFAULT_INIT_RETRIES,
      retryDelay: json.init_retry_delay ?? DEFAULT_INIT_RETRY_DELAY,
    }
  );
  const capabilitiesText = await capabilitiesResponse.text();
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(capabilitiesText);
  const layer = json.layer ?? capabilities["Contents"]["Layer"][0]["Title"];

  const options = optionsFromCapabilities(capabilities, {
    layer: layer,
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
