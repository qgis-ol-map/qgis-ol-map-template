import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { LayerJson } from "../layers";
import type { RootState } from ".";

export type LayerConfig = {
  uid: string;
  parent?: string;
  json: LayerJson;
};

const layersSlice = createSlice({
  name: "layerConfig",
  initialState: [] as Array<LayerConfig>,
  reducers: {
    layerAdded(state, action) {
      state.push({
        uid: action.payload.uid,
        parent: action.payload.parent,
        json: action.payload.json,
      });
    },
  },
});

export const { layerAdded } = layersSlice.actions;
export default layersSlice.reducer;

export const layersByParent = createSelector(
  [
    (state: RootState) => state?.layerConfig ?? [],
    (_state: RootState, parentUid: string | null) => parentUid,
  ],
  (layers: Array<LayerConfig>, parentUid: string | null) =>
    layers
      .filter((layer: LayerConfig) => layer.parent == parentUid)
      .sort((a, b) => a.json.index - b.json.index)
);
