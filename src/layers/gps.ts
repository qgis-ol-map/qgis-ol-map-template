import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature.js";
import Geolocation from "ol/Geolocation.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Point from "ol/geom/Point.js";
import type { CommonLayerJson } from ".";

export type GpsLayerJson = CommonLayerJson & {
};

export const gpsLayerFromJson = async (json: GpsLayerJson) => {
  const geolocation = new Geolocation({
    // enableHighAccuracy must be set to true to have the heading value.
    trackingOptions: {
      enableHighAccuracy: true,
    },
  });

  const accuracyFeature = new Feature();
  geolocation.on("change:accuracyGeometry", function () {
    const geometry = geolocation.getAccuracyGeometry();
    accuracyFeature.setGeometry(geometry ?? undefined);
  });

  const positionFeature = new Feature();
  positionFeature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({
          color: "#3399CC",
        }),
        stroke: new Stroke({
          color: "#fff",
          width: 2,
        }),
      }),
    })
  );

  geolocation.on("change:position", function () {
    const coordinates = geolocation.getPosition();
    positionFeature.setGeometry(
      coordinates ? new Point(coordinates) : undefined
    );
  });

  const source = new VectorSource({
    features: [accuracyFeature, positionFeature],
    attributions: json.attribution,
    ...json.sourceParams,
  });

  const layer = new VectorLayer({
    opacity: json.opacity ?? 1.0,
    zIndex: json.zIndex ?? null,
    visible: json.visible ?? true,
    source,
    ...json.layerParams,
  });

  geolocation.setTracking(true);

  return layer;
};
