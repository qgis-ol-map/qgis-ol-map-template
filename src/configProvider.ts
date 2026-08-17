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

export type PwaIconConfig = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

export type PwaConfig = {
  enabled?: boolean;
  name?: string;
  shortName?: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
  icons?: PwaIconConfig[];
};

export type Config = {
  viewport?: Viewport;
  epsgs: Record<string, string>;
  layers: Record<string, LayerJson>;
  pwa?: PwaConfig;
};

export const getConfig = (): Config => {
  return mergeDeep(config, configOverride);
};
