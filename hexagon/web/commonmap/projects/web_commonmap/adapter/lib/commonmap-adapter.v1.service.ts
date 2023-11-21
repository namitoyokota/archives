import { Injectable } from '@angular/core';
import { Location$v1 } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService, MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import * as Common from '@galileo/web_commonmap/_common';
import { lineString as Line, nearestPointOnLine, point as Point } from '@turf/turf';
import { ReplaySubject } from 'rxjs';
import { filter, first } from 'rxjs/operators';

/**
 * All notifications exposed through the adapter
 */
export interface MapAdapterEvents {

    /**
    * Notification that a map has been created.
    *
    */

    mapViewLoaded$: ReplaySubject<Common.MapCommunication$v1>;
}

@Injectable({
    providedIn: 'root'
})

export class CommonmapAdapterService$v1 {

    mapAdapterEvents: MapAdapterEvents = {
        mapViewLoaded$: new ReplaySubject<Common.MapCommunication$v1>()
    };

    constructor(
        private mailboxSvc: Common.CommonmapMailboxService,
        private layoutCompiler: LayoutCompilerAdapterService
    ) {
        // Make sure the core module is loaded
        this.layoutCompiler.loadCapabilityCoreAsync(Common.capabilityId);

        mailboxSvc.mailbox$v1.mapViewLoaded$.subscribe((mapComm: Common.MapCommunication$v1) => {
            this.mapAdapterEvents.mapViewLoaded$.next(mapComm);
        });
    }

    /**
     * Allows a method to wait for the core to be loaded
     */
     waitOnCore(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.mailboxSvc.mailbox$v1.coreIsLoaded$.pipe(
                filter(isLoaded => isLoaded),
                first()
            ).subscribe(() => {
                resolve();
            });
        });
    }

    /**
     * Called by map providers when an instance of their map has been initialized.  The common map will
     * fire the mapViewLoaded$ event to all the map listeners.
     *
     * @param mapComm MapCommunication object associated with by the initialized map
     */
    async notifyMapViewLoaded(mapComm: Common.MapCommunication$v1) {
        await this.waitOnCore();
        this.mailboxSvc.mailbox$v1.notifyMapViewLoaded$.next(mapComm);
    }

    /**
     * Registers an admin component for a map provider.  The common map will add this to its list of
     * map admin components and will make it accessable on the Map Administration page.
     *
     * @param adminComponentData MapAdminComponentData$v1 object that provides the information used to
     * inject the admin component on the Map Administrator page
     */
    async registerMapAdminComponent(adminComp: Common.MapAdminComponentData$v1) {
        await this.waitOnCore();
        this.mailboxSvc.mailbox$v1.registerMapAdminComponent$.next(adminComp);
    }

    /**
     * Registers an map layer component.  The common map will add this to its list of
     * map layers that are avaiable to be added to a map preset.
     *
     * @param mapLayerData MapAdminComponentData$v1 object that provides the information used to
     * inject the admin component on the Map Administrator page
     */
    async registerMapLayerComponent(mapLayerData: Common.MapLayerComponentData$v1) {
        await this.waitOnCore();
        this.mailboxSvc.mailbox$v1.registerMapLayerComponent$.next(mapLayerData);
    }

    /**
     * Get closest address at given coordinates
     * @param location Location infomration of the coordinates
     */
    async getAddress(location: Location$v1): Promise<Location$v1> {
        return new Promise<Location$v1>(async (resolve, reject) => {
            const mailbox = new MailBox<Location$v1, Location$v1>(location);

            // Listen for response in the mailbox
            mailbox.response.subscribe((result: Location$v1) => {
                resolve(result);
                mailbox.close();
            }, () => {
                reject();
                mailbox.close();
            });
            await this.waitOnCore();
            this.mailboxSvc.mailbox$v1.getAddress$.next(mailbox);
        });
    }

    /**
     * Get closest cross streets at given coordinates
     * @param location Location infomration of the coordinates
     */
    async getCrossStreet(location: Location$v1): Promise<Location$v1> {
        return new Promise<Location$v1>(async (resolve, reject) => {
            const mailbox = new MailBox<Location$v1, Location$v1>(location);

            // Listen for response in the mailbox
            mailbox.response.subscribe((result: Location$v1) => {
                resolve(result);
                mailbox.close();
            }, () => {
                reject();
                mailbox.close();
            });
            await this.waitOnCore();
            this.mailboxSvc.mailbox$v1.getCrossStreet$.next(mailbox);
        });
    }

    /**
     * Calculates distance to the closest point on the line from a given point
     * @param lines Coorindates for the lines
     * @param point Coorindates of the point
     */
    distanceFromLine(lines: [number[]], point: number[]): number {
        const turfLines = Line(lines);
        const turfPoint = Point(point);

        return nearestPointOnLine(turfLines, turfPoint).properties.dist * 1000;
    }
}
