import { AlarmWithAssetAssociation$v1, AlarmWithDeviceAssociation$v1 } from '@galileo/web_commonassociation/adapter';
import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { Alarm$v1 } from '../abstractions/alarm.v1';

/**
 * Version 1 of the methods used by the adapter and the core to communicate.
 */
export class Mailbox$v1 {
    /** Flag that is true when the core is loaded */
    coreIsLoaded$ = new BehaviorSubject<boolean>(false);

    /** Event used to filter out associations where the alarms are no longer available */
    filterAlarmDeviceAssociationsByMissingAlarms$ = new Subject<MailBox<any, Observable<AlarmWithDeviceAssociation$v1[]>>>();

    /** Event used to filter out associations where the alarms are no longer available */
    filterAlarmAssetAssociationsByMissingAlarms$ = new Subject<MailBox<any, Observable<AlarmWithAssetAssociation$v1[]>>>();

    /** Event that a call to get filter alarm device association by priority has been made */
    filterAlarmDeviceAssociationsByPriority$ = new Subject<MailBox<number, Observable<AlarmWithDeviceAssociation$v1[]>>>();

    /** Event that a call to get filter alarm device association by highest priority has been made */
    filterAlarmDeviceAssociationsByHighestPriority$ = new Subject<MailBox<void, Observable<AlarmWithDeviceAssociation$v1[]>>>();

    /** Event bus for request to get alarm by id. */
    getAlarm$ = new Subject<MailBox<string, Alarm$v1>>();
}
