import "./LayerMenu.css";

import Control from "ol/control/Control";
import { type Options as ControlOptions } from "ol/control/Control";
import { createRoot } from "react-dom/client";
import { store, useSelector, useDispatch } from "../../state";
import { layersByParent, type LayerConfig } from "../../state/layerConfig";
import { Provider } from "react-redux";
import { useState, type ChangeEvent } from "react";
import { layerByUid } from "../../state/mapLayers";
import {
  layerConfiguredVisibility,
  manualConfigByLayer,
} from "../../state/manualConfig";

type LayerItemProps = {
  layer: LayerConfig;
};

const LayerItemTitle = (props: LayerItemProps) => {
  const { layer } = props;

  const dispatch = useDispatch();

  const mapLayer = useSelector((state) => layerByUid(state, layer.uid));
  const manualConfig = useSelector((state) =>
    manualConfigByLayer(state, layer.uid)
  );

  const visibilityChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const visible = event.target.checked;
    dispatch(layerConfiguredVisibility({ uid: layer.uid, visible: visible }));
    if (!mapLayer) return;
    mapLayer.setVisible(visible);
  };

  const defaultVisible = manualConfig
    ? manualConfig.visible
    : (layer.json.visible ?? true);

  return (
    <>
      <input
        id={"layer-visible-" + layer.uid}
        type="checkbox"
        defaultChecked={defaultVisible}
        onChange={visibilityChanged}
      />
      <label htmlFor={"layer-visible-" + layer.uid}>{layer.json.title}</label>
    </>
  );
};

const LayerGroupItem = (props: LayerItemProps) => {
  const { layer } = props;
  const layers = useSelector((state) => layersByParent(state, layer.uid));
  return (
    <li>
      <LayerItemTitle layer={layer} />
      <ul>
        {layers.map((layer: LayerConfig) => (
          <ListItem key={layer.uid} layer={layer} />
        ))}
      </ul>
    </li>
  );
};

const LayerItem = (props: LayerItemProps) => {
  const { layer } = props;
  return (
    <li>
      <LayerItemTitle layer={layer} />
    </li>
  );
};

const ListItem = (props: LayerItemProps) => {
  const { layer } = props;
  if (layer.json.type == "group")
    return <LayerGroupItem key={layer.uid} layer={layer} />;
  return <LayerItem key={layer.uid} layer={layer} />;
};

const LayerList = () => {
  const layers = useSelector((state) => layersByParent(state, null));
  return (
    <ul>
      {layers.map((layer: LayerConfig) => (
        <ListItem key={layer.uid} layer={layer} />
      ))}
    </ul>
  );
};

const LayerMenu = () => {
  const [show, setShow] = useState(false);

  return (
    <Provider store={store}>
      {!show && (
        <div className="layer-menu closed">
          <div className="show-btn" onClick={() => setShow(true)}></div>
        </div>
      )}
      {show && (
        <div className="layer-menu open">
          <div className="hide-btn" onClick={() => setShow(false)}>
            DONE
          </div>
          <LayerList />
        </div>
      )}
    </Provider>
  );
};

export class LayerMenuControl extends Control {
  constructor(opt_options?: ControlOptions) {
    const options = Object.assign({}, opt_options);

    const element = document.createElement("div");
    const root = createRoot(element);
    root.render(<LayerMenu />);

    super({ element: element, target: options.target });
  }
}
