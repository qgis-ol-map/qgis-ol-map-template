import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Text from "ol/style/Text";
import type { FeatureLike } from "ol/Feature";
import memoize from "memoize";
import {
  CLUSTER_LABEL_FEATURE_FIELD,
  IS_CLUSTER_FEATURE_FIELD,
} from "../clustering/cluster";

export type VectorFeatureStyleJson = {
  symbol_size?: number;
  symbol_size_unit?: string;
  symbol_fill_color?: string;
  symbol_stroke_color?: string;
  symbol_stroke_width?: number;
  symbol_stroke_width_unit?: string;
  label_text_field?: string;
  label_text_color?: string;
  label_text_rotate?: boolean;
  label_font_family?: string;
  label_font_size?: number;
  label_font_size_unit?: string;
  label_font_weight?: number;
  label_font_italic?: boolean;
  label_outline_enabled?: boolean;
  label_outline_color?: string;
  label_outline_width?: number;
  label_outline_width_unit?: string;
  polygon_fill_color?: string;
  polygon_stroke_color?: string;
  polygon_stroke_width?: number;
  polygon_stroke_width_unit?: string;
  line_stroke_color?: string;
  line_stroke_width?: number;
  line_stroke_width_unit?: string;
};

const formatFont = (json: VectorFeatureStyleJson) => {
  const weight = json.label_font_weight ?? "normal";
  const size = json.label_font_size ?? 10;
  const unit = json.label_font_size_unit ?? "px";
  const family = json.label_font_family ?? "sans-serif";
  return `${weight} ${size}${unit} ${family}`;
};

const sizeAsPixels = (size?: number, unit?: string) => {
  if (size == undefined) return undefined;
  let multiplier = 1.0;
  if (unit == "mm") multiplier = 3.75;
  if (unit == "pt") multiplier = 1.333;
  return size * multiplier * window.devicePixelRatio;
};

export const makeStyleFunction = (json?: VectorFeatureStyleJson) => {
  if (!json) return undefined;

  const styleFunction = memoize((feature: FeatureLike, resolution: number) => {
    if (feature.get(IS_CLUSTER_FEATURE_FIELD)) {
      return styleForCluster(json, feature, resolution);
    }
    return styleForFeature(json, feature, resolution);
  });
  return styleFunction;
};

const styleForFeature = (
  json: VectorFeatureStyleJson,
  feature: FeatureLike,
  _resolution: number
) => {
  const size = sizeAsPixels(json.symbol_size ?? 5) ?? 5;
  return new Style({
    image: new CircleStyle({
      radius: size,
      fill: new Fill({ color: json.symbol_fill_color }),
      stroke: new Stroke({
        color: json.symbol_stroke_color,
        width: sizeAsPixels(
          json.symbol_stroke_width,
          json.symbol_stroke_width_unit
        ),
      }),
    }),
    text: json.label_text_field
      ? new Text({
          text: feature.get(json.label_text_field),
          font: formatFont(json),
          offsetY: -2 * size,
          fill: new Fill({ color: json.label_text_color }),
          rotateWithView: json.label_text_rotate ?? true,
          stroke: json.label_outline_enabled
            ? new Stroke({
                color: json.label_outline_color,
                width: sizeAsPixels(
                  json.label_outline_width,
                  json.label_outline_width_unit
                ),
              })
            : undefined,
        })
      : undefined,
    fill: new Fill({
      color: json.polygon_fill_color,
    }),
    stroke: new Stroke({
      color: json.line_stroke_color || json.polygon_stroke_color,
      width: sizeAsPixels(
        json.line_stroke_width || json.polygon_stroke_width,
        json.line_stroke_width_unit || json.polygon_stroke_width_unit
      ),
    }),
  });
};

const styleForCluster = (
  json: VectorFeatureStyleJson,
  feature: FeatureLike,
  _resolution: number
) => {
  const size = sizeAsPixels(json.symbol_size ?? 5) ?? 5;
  return new Style({
    image: new CircleStyle({
      radius: size,
      fill: new Fill({ color: json.symbol_fill_color }),
      stroke: new Stroke({
        color: json.symbol_stroke_color,
        width: sizeAsPixels(
          json.symbol_stroke_width,
          json.symbol_stroke_width_unit
        ),
      }),
    }),
    text: json.label_text_field
      ? new Text({
          text: feature.get(CLUSTER_LABEL_FEATURE_FIELD),
          font: formatFont(json),
          offsetY: -size / 2,
          textBaseline: "hanging",
          fill: new Fill({ color: json.symbol_stroke_color }),
        })
      : undefined,
  });
};
