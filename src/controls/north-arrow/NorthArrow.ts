import "./NortArrow.css";

import Control from "ol/control/Control";
import { type Options as ControlOptions } from "ol/control/Control";
import iconCompass from "./assets/compass.svg?raw";
import Map from "ol/Map";

export class NorthArrow extends Control {
  compass: HTMLElement;
  boundRotateEventListener: () => void;

  constructor(opt_options?: ControlOptions) {
    const options = Object.assign({}, opt_options);

    const element = document.createElement("div");
    element.className = "north-arrow";
    const compass = document.createElement("div");
    compass.innerHTML = iconCompass;
    compass.className = "compass";
    element.appendChild(compass);

    super({ element: element, target: options.target });

    this.compass = compass;
    this.rotateEventListener();

    this.boundRotateEventListener = this.rotateEventListener.bind(this);
  }

  rotateEventListener() {
    const rotation = this.getMap()?.getView().getRotation() ?? 0;
    const rotationDeg = Math.round((rotation * 180) / Math.PI);
    this.compass.style.rotate = `${rotationDeg}deg`;
  }

  setMap(map: Map | null) {
    const oldMap = this.getMap();
    if (oldMap) {
      oldMap
        .getView()
        .removeEventListener("change:rotation", this.boundRotateEventListener);
    }
    super.setMap(map);
    if (map) {
      map.getView().on("change:rotation", this.boundRotateEventListener);
      this.rotateEventListener();
    }
  }
}
