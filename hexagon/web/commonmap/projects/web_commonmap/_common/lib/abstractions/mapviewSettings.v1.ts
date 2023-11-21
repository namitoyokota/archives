import { ViewSettings$v1 } from '@galileo/web_commonlayoutmanager/adapter';
import { ZoomControlPositions$v1 } from './zoomControlPositions.v1';
import { LayerPanelControlPositions$v1 } from './layerPanelControlPositions.v1';
import { Point$v1 } from './point.v1';

/** Describes the information passed in from the layout manager to the MapView */
export interface MapviewSettings$v1 extends ViewSettings$v1 {
    mapSetup: {
        mapPresetId: string;
        displayZoomControl: boolean;
        zoomControlLocation: ZoomControlPositions$v1;
        zoomLevel: number;
        mapCenter: Point$v1;
    };
    layerPanel: {
        lockMapAndLayers: boolean;
        displayLayerPanel: boolean;
        layerPanelLocation: LayerPanelControlPositions$v1;
        allowLayerReorder: boolean;
    };
}
