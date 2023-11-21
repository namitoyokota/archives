import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import * as Common from '@galileo/web_commonmap/_common';

@Injectable({ providedIn: 'root' })
export class CommonmapEventService$v1 {

    /**
     * Event that is fired when all the map data is loaded
     */

    mapDataReady$: BehaviorSubject<void> = new BehaviorSubject(null);

    /**
     * Event that is fired when a new map preset is created
     */
    mapPresetAdded$ = new Subject<Common.MapPreset$v1>();

    /**
     * Event that is fired when a map preset is modified and saved
     */
    mapPresetUpdated$ = new Subject<Common.MapPreset$v1>();

    /**
     * Event that is fired when a map preset is deleted
     */
    mapPresetDeleted$ = new Subject<Common.MapPreset$v1>();

    /**
     * Event that is fired when a series of updates are made to map presets.  This happens if a layer is
     * modified and multiple presets use the layer
     */
    mapPresetsModified$ = new Subject<void>();

    /**
     * Event that is fired when a new map layer is created
     */
    mapLayerAdded$ = new Subject<Common.MapLayer$v1>();

    /**
     * Event that is fired when a map layer is modified and saved
     */
    mapLayerUpdated$ = new Subject<Common.MapLayer$v1>();

    /**
     * Event that is fired when a map layer is deleted
     */
    mapLayerDeleted$ = new Subject<Common.MapLayer$v1>();

}
