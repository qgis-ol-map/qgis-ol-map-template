import "./style.css";

import "ol/ol.css";

import Map from "ol/Map";
import View from "ol/View";
import { useGeographic } from "ol/proj.js";
import { layerFromJson } from "./layers";
import { loadEpsgs } from "./epsgUtils";
import { getConfig } from "./configProvider";
import { register as registerLayerMenu } from "./controls/LayerMenu";
import { store } from "./state";
import { layerAdded } from "./state/layerConfig";
import { v4 as uuidv4 } from "uuid";
import { layerAssigned } from "./state/mapLayers";
import { PositionControl } from "./controls/position-control/PositionControl";
import ScaleLine from "ol/control/ScaleLine.js";

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

    const layerUid = uuidv4();
    store.dispatch(
      layerAdded({
        uid: layerUid,
        parent: null,
        json: layerJson,
      })
    );

    layerFromJson(layerJson, layerUid).then((layer) => {
      if (layer) {
        map.addLayer(layer);
        store.dispatch(layerAssigned({ uid: layerUid, layer }));
      }
    });
  }

  registerLayerMenu(map);

  map.addControl(new PositionControl());

  map.addControl(new ScaleLine({
    units: "metric",
    bar: true,
    steps: 4,
    minWidth: 140,
  }));
};

initMap();
