import "./style.css";

import "ol/ol.css";
import "ol-layerswitcher/dist/ol-layerswitcher.css";

import Map from "ol/Map";
import View from "ol/View";
import { useGeographic } from "ol/proj.js";
import { layerFromJson } from "./layerUtils";
import LayerSwitcher from "ol-layerswitcher";
import { loadEpsgs } from "./epsgUtils";
import { getConfig } from "./configProvider";

const initMap = () => {
  useGeographic();

  const config = getConfig();

  const position = [51.505, -0.09];
  const map = new Map({
    target: "map",
    view: new View({
      center: position,
      zoom: 2,
    }),
  });

  loadEpsgs(config.epsgs);

  for (const layerJsonId in config.layers) {
    const layerJson = config.layers[layerJsonId];
    layerFromJson(layerJson).then((layer) => {
      if (layer) {
        map.addLayer(layer);
      }
    });
  }

  const layerSwitcher = new LayerSwitcher({
    groupSelectStyle: "group",
  });
  map.addControl(layerSwitcher);
};

initMap();
