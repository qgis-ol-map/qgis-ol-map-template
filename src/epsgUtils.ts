import { register } from "ol/proj/proj4.js";
import proj4 from "proj4";

export const loadEpsgs = (epsgsMapping: any) => {
  for (const epsgName in epsgsMapping) {
    const epsfDefinition = epsgsMapping[epsgName];
    proj4.defs(epsgName, epsfDefinition);
  }
  register(proj4);
};
