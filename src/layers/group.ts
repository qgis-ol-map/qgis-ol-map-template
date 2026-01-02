import LayerGroup from "ol/layer/Group";
import { layerFromJson, type CommonLayerJson, type LayerJson } from ".";
import { store } from "../state";
import { layerAdded } from "../state/layerConfig";
import { v4 as uuidv4 } from "uuid";
import { layerAssigned } from "../state/mapLayers";

export type GroupLayerJson = CommonLayerJson & {
  collapsed?: boolean;
  layers: Array<LayerJson>;
};

export const groupLayerFromJson = async (
  json: GroupLayerJson,
  layerUid: string
) => {
  const group = new LayerGroup({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    ...json.layerParams,
  });

  for (const layerJsonId in json.layers) {
    const layerJson = json.layers[layerJsonId];
    const nestedLayerUid = uuidv4();
    store.dispatch(
      layerAdded({
        uid: nestedLayerUid,
        parent: layerUid,
        json: layerJson,
      })
    );

    const layer = await layerFromJson(layerJson, nestedLayerUid);
    if (!layer) continue;

    layer.set("uid", nestedLayerUid);
    store.dispatch(layerAssigned({ uid: nestedLayerUid, layer }));

    const layers = group.getLayers();
    layers.push(layer);
    group.setLayers(layers);
  }
  return group;
};
