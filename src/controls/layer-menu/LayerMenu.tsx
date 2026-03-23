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
  layerConfiguredCollapsed,
  manualConfigByLayer,
} from "../../state/manualConfig";
import type { CommonVectorLayerJson } from "../../layers";
import GroupIcon from "./stack-back.svg";
import RasterIcon from "./layers-selected.svg";
import CollapseIcon from "./collapse.svg";
import type { GroupLayerJson } from "../../layers/group";

type LayerItemProps = {
  layer: LayerConfig;
  parentVisible: boolean;
};

const LayerItemTitle = (props: LayerItemProps) => {
  const { layer, parentVisible } = props;

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

  const visible: boolean = manualConfig?.visible ?? layer.json.visible ?? true;

  const groupIcon = layer.json.type == "group";
  const vectorStyle = (layer.json as CommonVectorLayerJson).style;
  const rasterIcon = !groupIcon && !vectorStyle;
  const vectorStylePreview: Record<string, string> = {
    display: "inline-block",
    width: "16px",
    height: "16px",
    background: "red",
    marginLeft: "5px",
    marginRight: "5px",
  };

  if (vectorStyle) {
    vectorStylePreview["border"] = "2px solid rgba(0 0 0 / 0)";

    if (vectorStyle.symbol_fill_color) {
      vectorStylePreview["borderRadius"] = "8px";
    } else if (vectorStyle.polygon_fill_color) {
      vectorStylePreview["borderRadius"] = "1px 10px 2px 8px";
    } else if (vectorStyle.line_stroke_color) {
      vectorStylePreview["borderRadius"] = "0px 0px 0px 6px";
      vectorStylePreview["borderWidth"] = "0px 0px 2px 2px";
    }

    vectorStylePreview["backgroundColor"] =
      vectorStyle.symbol_fill_color || vectorStyle.polygon_fill_color || "";
    vectorStylePreview["borderColor"] =
      vectorStyle.symbol_stroke_color ||
      vectorStyle.polygon_stroke_color ||
      vectorStyle.line_stroke_color ||
      "";
  }

  return (
    <>
      <input
        id={"layer-visible-" + layer.uid}
        type="checkbox"
        defaultChecked={visible}
        className={!parentVisible ? "disabled" : ""}
        onChange={visibilityChanged}
      />
      {vectorStyle && <div style={vectorStylePreview}></div>}
      <span className="icon">
        {groupIcon && <GroupIcon />}
        {rasterIcon && <RasterIcon />}
      </span>
      <label htmlFor={"layer-visible-" + layer.uid}>{layer.json.title}</label>
    </>
  );
};

const LayerGroupItem = (props: LayerItemProps) => {
  const { layer, parentVisible } = props;
  const dispatch = useDispatch();
  const layers = useSelector((state) => layersByParent(state, layer.uid));
  const manualConfig = useSelector((state) =>
    manualConfigByLayer(state, layer.uid)
  );

  const collapsed: boolean =
    manualConfig?.collapsed ??
    (layer.json as GroupLayerJson).collapsed ??
    false;

  const visible: boolean = manualConfig?.visible ?? layer.json.visible ?? true;

  const collapseToggleClicked = () => {
    dispatch(
      layerConfiguredCollapsed({ uid: layer.uid, collapsed: !collapsed })
    );
  };

  return (
    <li className={collapsed ? "layer-group collapsed" : "layer-group"}>
      <div onClick={collapseToggleClicked} className="collapse-btn">
        <CollapseIcon />
      </div>
      <LayerItemTitle layer={layer} parentVisible={parentVisible} />
      <ul>
        {layers.map((layer: LayerConfig) => (
          <ListItem key={layer.uid} layer={layer} parentVisible={visible} />
        ))}
      </ul>
    </li>
  );
};

const LayerItem = (props: LayerItemProps) => {
  const { layer, parentVisible } = props;
  return (
    <li>
      <LayerItemTitle layer={layer} parentVisible={parentVisible} />
    </li>
  );
};

const ListItem = (props: LayerItemProps) => {
  const { layer, parentVisible } = props;
  if (layer.json.type == "group")
    return (
      <LayerGroupItem
        key={layer.uid}
        layer={layer}
        parentVisible={parentVisible}
      />
    );
  return (
    <LayerItem key={layer.uid} layer={layer} parentVisible={parentVisible} />
  );
};

const LayerList = () => {
  const layers = useSelector((state) => layersByParent(state, null));
  return (
    <ul>
      {layers.map((layer: LayerConfig) => (
        <ListItem key={layer.uid} layer={layer} parentVisible={true} />
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
