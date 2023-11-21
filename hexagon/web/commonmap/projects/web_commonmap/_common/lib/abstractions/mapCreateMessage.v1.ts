import { MapSettings$v1 } from './mapSettings.v1';
import { MapCommunication$v1 } from './mapCommunication.v1';
import { BehaviorSubject } from 'rxjs';

/** Private class to send information from adapter to core map component */
export class MapCreateMessage$v1 {
    /** Map settings info */
    mapSettings?: MapSettings$v1;

    /** Event to signal when map is ready */
    mapReady$?: BehaviorSubject<MapCommunication$v1>;

    constructor(params = {} as MapCreateMessage$v1) {
        const {
            mapSettings
        } = params;

        this.mapSettings = mapSettings;
        this.mapReady$ = new BehaviorSubject<MapCommunication$v1>(null);
    }
}
