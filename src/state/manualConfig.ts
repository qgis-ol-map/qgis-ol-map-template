import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { RootState } from ".";

export type ManualConfig = {
  visible?: boolean;
  collapsed?: boolean;
};

const DEFAULT_CONFIG: ManualConfig = {
  visible: undefined,
  collapsed: undefined,
};

const manualConfigSlice = createSlice({
  name: "manualConfig",
  initialState: {} as Record<string, ManualConfig>,
  reducers: {
    layerConfiguredVisibility(state, action) {
      const existing: ManualConfig =
        state[action.payload.uid] ?? DEFAULT_CONFIG;
      state[action.payload.uid] = {
        ...existing,
        visible: action.payload.visible,
      };
    },
    layerConfiguredCollapsed(state, action) {
      const existing: ManualConfig =
        state[action.payload.uid] ?? DEFAULT_CONFIG;
      state[action.payload.uid] = {
        ...existing,
        collapsed: action.payload.collapsed,
      };
    },
  },
});

export const { layerConfiguredVisibility, layerConfiguredCollapsed } =
  manualConfigSlice.actions;
export default manualConfigSlice.reducer;

export const manualConfigByLayer = createSelector(
  [
    (state: RootState) => state?.manualConfig ?? {},
    (_state: RootState, parentUid: string) => parentUid,
  ],
  (config, layerUid: string) => config[layerUid]
);
