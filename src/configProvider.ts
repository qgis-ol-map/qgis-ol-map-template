import config from "../config/config";
import configOverride from "../config/configOverride";
import type { LayerJson } from "./layers";
import { mergeDeep } from "./utils/objectMerge";

export type Viewport = {
  center: {
    x: number;
    y: number;
  };
  zoom: number;
};

type Config = {
  viewport?: Viewport;
  epsgs: Record<string, string>;
  layers: Record<string, LayerJson>;
};

export const getConfig = (): Config => {
  return mergeDeep(config, configOverride);
};
