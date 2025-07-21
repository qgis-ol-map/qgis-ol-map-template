import { createSlice, createSelector } from "@reduxjs/toolkit";
import type { RootState } from ".";
import type Layer from "ol/layer/Layer";

const layersSlice = createSlice({
  name: "mapLayers",
  initialState: {} as Record<string, Layer | null>,
  reducers: {
    layerAssigned(state, action) {
      state[action.payload.uid] = action.payload.layer;
    },
  },
});

export const { layerAssigned } = layersSlice.actions;
export default layersSlice.reducer;

export const layerByUid = createSelector(
  [
    (state: RootState) => state?.mapLayers ?? {},
    (_state: RootState, layerUid: string | null) => layerUid,
  ],
  (layers, layerUid) => (layerUid ? layers[layerUid] : null)
);
