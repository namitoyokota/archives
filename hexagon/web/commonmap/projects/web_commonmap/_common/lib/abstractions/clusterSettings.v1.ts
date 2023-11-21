import { IconDefinition2d$v1 } from './iconDefinition2d.v1';
import { IconDefinition3d$v1 } from './iconDefinition3d.v1';

/** Information needed to calculate and render a cluster markers on the map for a layer */
export class ClusterSettings$v1<T> {

    /** Flag to indicate if clustering is enabled for a layer */
    enableClustering: boolean;

    /** Icon to use for the cluster marker on 2d map */
    iconDefinition2d?: IconDefinition2d$v1;

    /** Icon to use for the cluster marker on 3d map */
    iconDefinition3d?: IconDefinition3d$v1;

    /** Object to store private properties. */
    properties?: T;

    /** The maximum radius that a cluster will cover from the central marker (in pixels).
    *   Decreasing will make more, smaller clusters.
    */
    clusterRadius?: number;

    constructor(params: ClusterSettings$v1<T> = {} as ClusterSettings$v1<T>) {
        const {
            clusterRadius,
            iconDefinition2d,
            iconDefinition3d,
            properties,
            enableClustering = true
        } = params;

        this.clusterRadius = clusterRadius;
        this.iconDefinition2d = iconDefinition2d;
        this.iconDefinition3d = iconDefinition3d;
        this.enableClustering = enableClustering;
        this.properties = properties;
    }
}
