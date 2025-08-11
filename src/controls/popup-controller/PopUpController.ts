import "bootstrap/dist/css/bootstrap.min.css";

import Overlay from "ol/Overlay.js";
import Map from "ol/Map";
import { layerByUid } from "../../state/layerConfig";
import { store } from "../../state";
import type { CommonVectorLayerJson } from "../../layers";
import { IS_CLUSTER_FEATURE_FIELD } from "../../layers/clustering/cluster";

const HAS_POPUP_FIELD = "__hasPopup";
const HAS_CLUSTER_POPUP_FIELD = "__hasClusterPopup";

export const makePopupProps = (json: CommonVectorLayerJson) => {
  return {
    __hasPopup: json.popup != undefined,
    __hasClusterPopup: json.clustering?.popup != undefined,
  };
};

export class PopUpController {
  register(map: Map) {
    const element = document.getElementById("popup");

    if (!element) return;

    const popup = new Overlay({
      element: element,
      positioning: "bottom-center",
      stopEvent: false,
    });
    map.addOverlay(popup);

    let disposeFn: (() => void) | undefined | null = undefined;
    const disposePopover = () => {
      if (disposeFn) {
        disposeFn();
        disposeFn = undefined;
      }
    };

    // display popup on click
    map.on("click", (evt) => {
      disposePopover();
      const featureAndLayer = map.forEachFeatureAtPixel(
        evt.pixel,
        function (feature, layer) {
          if (feature.get(IS_CLUSTER_FEATURE_FIELD)) {
            if (layer.get(HAS_CLUSTER_POPUP_FIELD)) {
              return { feature, layer };
            }
          } else if (layer.get(HAS_POPUP_FIELD)) {
            return { feature, layer };
          }
        }
      );

      if (!featureAndLayer) {
        return;
      }

      const { feature, layer } = featureAndLayer;

      if (!feature) {
        return;
      }

      const state = store.getState();
      const layerConfig = layerByUid(state, layer.get("uid"));

      const popupFn = feature.get(IS_CLUSTER_FEATURE_FIELD)
        ? (layerConfig?.json as CommonVectorLayerJson).clustering?.popup
        : (layerConfig?.json as CommonVectorLayerJson).popup;

      if (!popupFn) return;

      disposeFn = popupFn(element, feature, layer);

      popup.setPosition(evt.coordinate);
    });

    // change mouse cursor when over marker
    map.on("pointermove", (e) => {
      const hit = map.hasFeatureAtPixel(e.pixel);
      const hitFeatureWithPopup =
        hit &&
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
          if (feature.get(IS_CLUSTER_FEATURE_FIELD)) {
            if (layer.get(HAS_CLUSTER_POPUP_FIELD)) {
              return true;
            }
          } else if (layer.get(HAS_POPUP_FIELD)) {
            return true;
          }
        });
      map.getTargetElement().style.cursor = hitFeatureWithPopup
        ? "pointer"
        : "";
    });

    // Close the popup when the map is moved
    map.on("movestart", () => disposePopover());
  }
}
