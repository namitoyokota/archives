import { Injectable } from '@angular/core';
import { Alarm$v1, capabilityId, CommonMailboxService } from '@galileo/web_alarms/_common';
import { AlarmWithAssetAssociation$v1, AlarmWithDeviceAssociation$v1 } from '@galileo/web_commonassociation/adapter';
import { LayoutCompilerAdapterService, MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';

import { AlarmsAdapterModule } from './adapter.module';

@Injectable({
    providedIn: AlarmsAdapterModule
})
/**
 * The adapter service is the public API that other capabilities can consume.
 */
export class AlarmsAdapterService$v1 {

    constructor(private mailbox: CommonMailboxService,
                private layoutCompiler: LayoutCompilerAdapterService) {

        // Make sure the core module is loaded
        this.layoutCompiler.loadCapabilityCoreAsync(capabilityId);
    }

    /**
     * Returns a stream of filtered associations
     * @param priority Alarm priority to filter association by
     */
    filterAlarmDeviceAssociationsByPriorityAsync(priority: number): Promise<Observable<AlarmWithDeviceAssociation$v1[]>> {
        return new Promise<Observable<AlarmWithDeviceAssociation$v1[]>>(async resolve => {
            const mailbox = new MailBox<number, Observable<AlarmWithDeviceAssociation$v1[]>>(priority);

            // Listen for response
            mailbox.response.pipe(first()).subscribe(associations$ => {
                resolve(associations$);
            });

            await this.loadCore();
            this.mailbox.mailbox$v1.filterAlarmDeviceAssociationsByPriority$.next(mailbox);
        });
    }

    /**
     * Returns a stream of filtered associations.
     * Only returns associations that contain the highest priority alarm.
     */
    filterAlarmDeviceAssociationsByHighestPriority(): Promise<Observable<AlarmWithDeviceAssociation$v1[]>> {
        return new Promise<Observable<AlarmWithDeviceAssociation$v1[]>>(async resolve => {
            const mailbox = new MailBox<void, Observable<AlarmWithDeviceAssociation$v1[]>>();

            // Listen for response
            mailbox.response.pipe(first()).subscribe(associations$ => {
                resolve(associations$);
            });

            await this.loadCore();
            this.mailbox.mailbox$v1.filterAlarmDeviceAssociationsByHighestPriority$.next(mailbox);
        });
    }

    /**
     * Returns a stream of filtered associations.
     * Only returns associations where the alarms exist.
     *
     * @param alarmId - Optional parameter to get associations for specific alarm
     * @param deviceId = Optional parameter to get associations for specific device
     *
     */
    filterAlarmDeviceAssociationsByMissingAlarms(alarmId?: string, deviceId?: string):
         Promise<Observable<AlarmWithDeviceAssociation$v1[]>> {
        return new Promise<Observable<AlarmWithDeviceAssociation$v1[]>>(async resolve => {
            const mailbox = new MailBox<any, Observable<AlarmWithDeviceAssociation$v1[]>>();

            mailbox.payload = { alarmId: alarmId, deviceId: deviceId};

            // Listen for response
            mailbox.response.pipe(first()).subscribe(associations$ => {
                resolve(associations$);
            });

            await this.loadCore();
            this.mailbox.mailbox$v1.filterAlarmDeviceAssociationsByMissingAlarms$.next(mailbox);
        });
    }

    /**
     * Returns a stream of filtered associations.
     * Only returns associations that contain the highest priority alarm.
     *
     * @param alarmId - Optional parameter to get associations for specific alarm
     * @param assetId = Optional parameter to get associations for specific device
     *
     */
    filterAlarmAssetAssociationsByMissingAlarms(alarmId?: string, assetId?: string): Promise<Observable<AlarmWithAssetAssociation$v1[]>> {
        return new Promise<Observable<AlarmWithAssetAssociation$v1[]>>(async resolve => {
            const mailbox = new MailBox<any, Observable<AlarmWithAssetAssociation$v1[]>>();

            mailbox.payload = { alarmId: alarmId, assetId: assetId};

            // Listen for response
            mailbox.response.pipe(first()).subscribe(associations$ => {
                resolve(associations$);
            });

            await this.loadCore();
            this.mailbox.mailbox$v1.filterAlarmAssetAssociationsByMissingAlarms$.next(mailbox);
        });
    }

    /**
     * Gets Alarm by id
     * @param alarmId Alarm id
     */
    getAlarmAsync(alarmId: string): Promise<Alarm$v1> {
        return new Promise<Alarm$v1>(async (resolve, reject) => {
            await this.loadCore();

            const mailbox = new MailBox<string, Alarm$v1>(alarmId);

            mailbox.response.pipe(first()).subscribe((alarm: Alarm$v1) => {
                resolve(alarm);
            }, () => {
                reject();
            });

            this.mailbox.mailbox$v1.getAlarm$.next(mailbox);
        });
    }

    /**
     * Allows a method to wait for the core to be loaded
     */
    loadCore(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.layoutCompiler.loadCapabilityCoreAsync(capabilityId);

            this.mailbox.mailbox$v1.coreIsLoaded$.pipe(
                filter(isLoaded => isLoaded),
                first()
            ).subscribe(() => {
                resolve();
            });
        });
    }

}
