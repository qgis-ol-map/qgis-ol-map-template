import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { RootState } from ".";

export type ManualConfig = {
  visible: boolean;
};

const manualConfigSlice = createSlice({
  name: "manualConfig",
  initialState: {} as Record<string, ManualConfig>,
  reducers: {
    layerConfiguredVisibility(state, action) {
      const existing = state[action.payload.uid] ?? {};
      state[action.payload.uid] = {
        ...existing,
        visible: action.payload.visible,
      };
    },
  },
});

export const { layerConfiguredVisibility } = manualConfigSlice.actions;
export default manualConfigSlice.reducer;

export const manualConfigByLayer = createSelector(
  [
    (state: RootState) => state?.manualConfig ?? {},
    (_state: RootState, parentUid: string) => parentUid,
  ],
  (config, layerUid: string) => config[layerUid]
);
