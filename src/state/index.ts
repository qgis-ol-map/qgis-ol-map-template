import { configureStore } from "@reduxjs/toolkit";
import layerConfigReducer from "./layerConfig";
import mapLayersReducer from "./mapLayers";
import manualConfigReducer from "./manualConfig";
import {
  useDispatch as baseUseDispatch,
  useSelector as baseUseSelector,
} from "react-redux";

export const store = configureStore({
  reducer: {
    layerConfig: layerConfigReducer,
    mapLayers: mapLayersReducer,
    manualConfig: manualConfigReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.layer"],
        ignoredPaths: ["mapLayers"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type Dispatch = typeof store.dispatch;
export const useDispatch = baseUseDispatch.withTypes<Dispatch>();
export const useSelector = baseUseSelector.withTypes<RootState>();
