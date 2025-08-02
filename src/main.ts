import "./style.css";

import "ol/ol.css";

import Map from "ol/Map";
import View from "ol/View";
import { useGeographic } from "ol/proj.js";
import { layerFromJson } from "./layers";
import { loadEpsgs } from "./epsgUtils";
import { getConfig } from "./configProvider";
import { LayerMenuControl } from "./controls/layer-menu/LayerMenu";
import { store } from "./state";
import { layerAdded } from "./state/layerConfig";
import { v4 as uuidv4 } from "uuid";
import { layerAssigned } from "./state/mapLayers";
import { PositionControl } from "./controls/position-control/PositionControl";
import ScaleLine from "ol/control/ScaleLine.js";
import Zoom from "ol/control/Zoom.js";

const initMap = () => {
  useGeographic();

  const config = getConfig();

  let position = [
    config.viewport?.center.x ?? 0,
    config.viewport?.center.y ?? 0,
  ];

  const map = new Map({
    target: "map",
    controls: [],
    view: new View({
      center: position,
      zoom: config.viewport?.zoom ?? 18,
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

  map.addControl(new Zoom());
  map.addControl(new PositionControl());
  map.addControl(new LayerMenuControl());

  map.addControl(
    new ScaleLine({
      units: "metric",
      bar: true,
      steps: 4,
      minWidth: 140,
    })
  );
};

initMap();
