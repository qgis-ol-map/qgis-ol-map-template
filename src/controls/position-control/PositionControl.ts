import "./PositionControl.css";

import Control from "ol/control/Control";
import { type Options as ControlOptions } from "ol/control/Control";
import type Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature.js";
import Geolocation from "ol/Geolocation.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Point from "ol/geom/Point.js";

import iconOff from "./assets/current-location-off.svg?raw";
import iconPosition from "./assets/current-location.svg?raw";
import iconFollow from "./assets/location.svg?raw";
import type { Coordinate } from "ol/coordinate";
import Map from "ol/Map";

type State = "off" | "position" | "follow";

type DeviceOrientationPermission = "granted" | "denied" | "default";

type OrientationState = {
  degree: number;
  accuracy: number;
  absolute: boolean;
};

const POSITION_AUTO_ZOOM = 19;
const POSITION_THROTTLE_MS = 500;
const HEADING_THROTTLE_MS = 50;
const DEFAULT_MAP_ROTATION = 0;

const isSafari: boolean = (() => {
  try {
    return Boolean(
      navigator &&
        navigator.userAgent &&
        navigator.userAgent.includes("Safari/") &&
        !(
          navigator.userAgent.includes("Chrome/") ||
          navigator.userAgent.includes("Chromium/")
        )
    );
  } catch {
    return false;
  }
})();

const orientationSupported = "onorientationchange" in window;

export class PositionControl extends Control {
  state: State = "off";
  layer: Layer;
  geolocation: Geolocation;

  positionFeature: Feature;
  accuracyFeature: Feature;

  zoomOnNextPosition: boolean = false;
  lastPosition?: Coordinate;
  lastHeading?: number;

  positionThrottleLock: boolean = false;
  headingThrottleLock: boolean = false;

  boundOrientationEventListener: (e: DeviceOrientationEvent) => void;
  boundInteractionEventListener: () => void;

  constructor(opt_options?: ControlOptions) {
    const options = Object.assign({}, opt_options);

    const element = document.createElement("div");
    super({ element: element, target: options.target });

    this.updateButton();

    this.element.onclick = () => this.toggleState();

    const geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
    });

    const accuracyFeature = new Feature();
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

    geolocation.on("change:accuracyGeometry", () => this.accuracyUpdate());
    geolocation.on("change:position", () => this.positionUpdate());

    const source = new VectorSource({
      features: [accuracyFeature, positionFeature],
    });

    this.layer = new VectorLayer({
      source,
      zIndex: 99999,
    });

    this.geolocation = geolocation;
    this.positionFeature = positionFeature;
    this.accuracyFeature = accuracyFeature;

    this.boundOrientationEventListener =
      this.orientationEventListener.bind(this);

    this.boundInteractionEventListener =
      this.interactionEventListener.bind(this);
  }

  setMap(map: Map | null) {
    const oldMap = this.getMap();
    if (oldMap) {
      oldMap
        .getView()
        .removeEventListener(
          "change:center",
          this.boundInteractionEventListener
        );
      oldMap
        .getView()
        .removeEventListener(
          "change:rotation",
          this.boundInteractionEventListener
        );
    }
    super.setMap(map);
    if (map) {
      map.getView().on("change:center", this.boundInteractionEventListener);
      map.getView().on("change:rotation", this.boundInteractionEventListener);
    }
  }

  toggleState() {
    if (this.state == "off") {
      this.state = "position";
      this.startPosition();
    } else if (this.state == "position") {
      if (orientationSupported) {
        this.state = "follow";
        this.startHeading();
      } else {
        this.state = "off";
        this.stopPosition();
      }
    } else if (this.state == "follow") {
      this.state = "off";
      this.stopHeading();
      this.stopPosition();
      this.resetRotation();
    }
    this.updateButton();
  }

  stateStopFollow() {
    if (this.state == "follow") {
      this.state = "position";
      this.stopHeading();
      this.updateButton();
    }
  }

  updateButton() {
    if (this.state == "off") this.element.innerHTML = iconOff;
    if (this.state == "position") this.element.innerHTML = iconPosition;
    if (this.state == "follow") this.element.innerHTML = iconFollow;
    this.element.className = "position-button " + this.state;
  }

  startPosition() {
    this.getMap()?.addLayer(this.layer);
    this.zoomOnNextPosition = true;
    this.geolocation.setTracking(true);
  }

  startHeading() {
    this.requestOrientationPermission();
    this.registerOrientationEventListener();
  }

  stopPosition() {
    this.geolocation.setTracking(false);
    this.getMap()?.removeLayer(this.layer);
    this.positionFeature.setGeometry(undefined);
    this.accuracyFeature.setGeometry(undefined);
  }

  stopHeading() {
    this.unregisterOrientationEventListener();
  }

  resetRotation() {
    this.getMap()?.getView().setRotation(DEFAULT_MAP_ROTATION);
  }

  positionUpdate() {
    const coordinates = this.geolocation.getPosition();

    if (this.lastPosition == coordinates) return;
    if (this.positionThrottleLock) return;

    if (this.zoomOnNextPosition) {
      this.zoomOnNextPosition = false;
      this.getMap()?.getView().setCenter(coordinates);
      const currentZoom = this.getMap()?.getView().getZoom() ?? 0;
      if (currentZoom < POSITION_AUTO_ZOOM) {
        this.getMap()?.getView().setZoom(POSITION_AUTO_ZOOM);
      }
    }

    this.lastPosition = coordinates;
    this.positionThrottleLock = true;
    setTimeout(() => (this.positionThrottleLock = false), POSITION_THROTTLE_MS);

    this.positionFeature.setGeometry(
      coordinates ? new Point(coordinates) : undefined
    );

    if (coordinates && this.state == "follow") {
      this.getMap()?.getView().setCenter(coordinates);
    }
  }

  accuracyUpdate() {
    const geometry = this.geolocation.getAccuracyGeometry();
    this.accuracyFeature.setGeometry(geometry ?? undefined);
  }

  orientationUpdate(orientation: OrientationState | null) {
    const heading = orientation?.degree;
    if (this.lastHeading == heading) return;
    if (this.headingThrottleLock) return;

    this.lastHeading = heading;
    this.headingThrottleLock = true;
    setTimeout(() => (this.headingThrottleLock = false), HEADING_THROTTLE_MS);

    if (!heading) {
      this.getMap()?.getView().setRotation(DEFAULT_MAP_ROTATION);
      return;
    }

    this.getMap()
      ?.getView()
      .setRotation((heading * Math.PI) / 180);
  }

  requestOrientationPermission(): Promise<DeviceOrientationPermission> {
    const ret = Promise.resolve("granted" as DeviceOrientationPermission);
    if (
      isSafari &&
      typeof DeviceOrientationEvent !== "undefined" &&
      // @ts-ignore
      typeof DeviceOrientationEvent?.requestPermission === "function"
    ) {
      // @ts-ignore
      return DeviceOrientationEvent.requestPermission();
    }
    return ret;
  }

  orientationEventListener(e: DeviceOrientationEvent) {
    // @ts-ignore
    if (typeof e.webkitCompassHeading !== "undefined") {
      this.orientationUpdate({
        // @ts-ignore
        degree: 360 - e.webkitCompassHeading,
        // @ts-ignore
        accuracy: e.webkitCompassAccuracy,
        absolute: e.absolute,
      });
    } else {
      this.orientationUpdate(
        e.alpha !== null
          ? { degree: e.alpha, accuracy: 0, absolute: e.absolute }
          : null
      );
    }
  }

  registerOrientationEventListener() {
    window.addEventListener(
      "deviceorientationabsolute",
      this.boundOrientationEventListener
    );
    window.addEventListener(
      "deviceorientation",
      this.boundOrientationEventListener
    );
  }

  unregisterOrientationEventListener() {
    window.removeEventListener(
      "deviceorientationabsolute",
      this.boundOrientationEventListener
    );
    window.removeEventListener(
      "deviceorientation",
      this.boundOrientationEventListener
    );
  }

  interactionEventListener() {
    if (this.getMap()?.getView().getInteracting()) {
      if (this.state == "follow") {
        this.stateStopFollow();
      }
    }
  }
}
