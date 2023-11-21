import { Injectable } from '@angular/core';
import { StoreService } from '@galileo/web_common-libraries';
import { Changelog$v1 } from '@galileo/web_commonidentity/adapter';
import { BehaviorSubject } from 'rxjs';

/**
 * Store for User Group Manager Changelogs
 */
@Injectable()
export class OrganizationChangelogStoreService extends StoreService<Changelog$v1> {

    /** Flag to indicate that all logs have been loaded */
    allLogsLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor() {
        super('id', Changelog$v1);
    }
}
