import { Cluster } from "ol/source";
import type { Geometry } from "ol/geom";
import type { Feature } from "ol";
import type VectorSource from "ol/source/Vector";

export const CLUSTER_LABEL_FEATURE_FIELD = "__ClusterLabel";
export const IS_CLUSTER_FEATURE_FIELD = "__IsCluster";

export type ClusteringConfigJson = {
  enabled?: boolean;
  distance?: number;
  minDistance?: number;
};

export class ClusterWithOrphans extends Cluster {
  protected createCluster(
    features: Feature<Geometry>[],
    extent: import("ol/extent").Extent
  ): Feature {
    if (features.length == 1) {
      return features[0];
    }
    const cluster = super.createCluster(features, extent);
    cluster.set(CLUSTER_LABEL_FEATURE_FIELD, features.length.toString());
    cluster.set(IS_CLUSTER_FEATURE_FIELD, true);
    return cluster;
  }
}

export const wrapSourceWithClustering = (
  source: VectorSource,
  json?: ClusteringConfigJson
) => {
  return json?.enabled
    ? new ClusterWithOrphans({
        minDistance: json.minDistance,
        distance: json.distance,
        source: source,
      })
    : source;
};
