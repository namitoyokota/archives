import { CompatibleOptions$v1 } from '@galileo/web_commontenant/adapter';
import { MapAdminComponentData$v1 } from './mapAdminCompData.v1';
import { MapLayerComponentData$v1 } from './mapLayerCompData.v1';

/** Represents the data a capability loaded into data storage that exposes common map compatible options */
export class MapCompatibleOptions$v1 extends CompatibleOptions$v1 {
    /** The mapLayers option will expose any map layers that the capability has defined */
    mapLayers?: MapLayerComponentData$v1[];

    /** The mapAdminComponent option will provided the information for an injectable component that can be
     *  used to set up map data for the map provider */
    mapAdminComponent?: MapAdminComponentData$v1;
}
