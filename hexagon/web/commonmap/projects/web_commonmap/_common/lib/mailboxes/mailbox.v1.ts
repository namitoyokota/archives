import { Location$v1 } from '@galileo/web_common-libraries';
import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

import { MapAdminComponentData$v1 } from '../abstractions/mapAdminCompData.v1';
import { MapCommunication$v1 } from '../abstractions/mapCommunication.v1';
import { MapLayerComponentData$v1 } from '../abstractions/mapLayerCompData.v1';

/**
 * Version 1 of the methods used by the adapter and core to communicate.
 */
export class Mailbox$v1 {
    /** Event called when a mapview has been created */
    mapViewLoaded$: ReplaySubject<MapCommunication$v1> = new ReplaySubject<MapCommunication$v1>();

    /** Event called by map providers to have the commonmap core fire the mapViewLoaded event */
    notifyMapViewLoaded$: ReplaySubject<MapCommunication$v1> = new ReplaySubject<MapCommunication$v1>();

    /** Event called by map providers to register an admin component that will be accessible from the
     * Map Administration page
     */
    registerMapAdminComponent$: ReplaySubject<MapAdminComponentData$v1> =
        new ReplaySubject<MapAdminComponentData$v1>();

    /** Event called by capability to register a map layer that will be accessible from the
     * Map Administration page to add to a map
     */
    registerMapLayerComponent$: ReplaySubject<MapLayerComponentData$v1> =
        new ReplaySubject<MapLayerComponentData$v1>();

    /** Flag that is true when the core is loaded */
    coreIsLoaded$ = new BehaviorSubject<boolean>(false);

    /** Event that a call to getAddress had been made */
    getAddress$ = new Subject<MailBox<Location$v1, Location$v1>>();

    /** Event that a call to getCrossStreet has been made */
    getCrossStreet$ = new Subject<MailBox<Location$v1, Location$v1>>();
}
