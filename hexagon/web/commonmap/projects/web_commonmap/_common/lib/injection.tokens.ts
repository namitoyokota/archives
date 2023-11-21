import { PORTAL_DATA } from '@galileo/web_commonlayoutmanager/adapter';
export const LAYOUT_MANAGER_SETTINGS = PORTAL_DATA;

export enum InjectableComponentNames {
    // {componentName} = '@hxgn/{capability}/{componentName}/{version}'
    MapComponent = '@hxgn/commonmap/map/v1',
    MapviewComponent = '@hxgn/commonmap/mapview/v1',
    OverlappingMarkersListComponent = '@hxgn/commonmap/overlappingmarkerslist/v1',
    MapviewSettingsComponent = '@hxgn/commonmap/mapview-settings/v1',
    MapConfigurationComponent = '@hxgn/commonmap/map-configuration/v1',
    WazeInjectableComponent$v1 = '@hxgn/commonmap/waze/v1',
    WazeSettingsInjectableComponent$v1 = '@hxgn/commonmap/waze-settings/v1',
    LocationSelectComponent = '@hxgn/commonmap/location-select/v1',
    PinMarkerComponent = '@hxgn/commonmap/pin-marker/v1'
}
