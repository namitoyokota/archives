import { Injectable } from '@angular/core';
import { NotificationCriteriaDataAccessor$v1, NotificationSettingDataAccessor$v1 } from '@galileo/platform_commonnotifications';
import {
    TokenManagerService,
} from '@galileo/web_common-http';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    /** Access v1 of Notification Criteria REST API */
    criteria: NotificationCriteriaDataAccessor$v1

    /** Access v1 of Notification Setting REST API */
    setting: NotificationSettingDataAccessor$v1;

    constructor(
        private tokenManagerSrv: TokenManagerService
    ) {
        this.criteria = new NotificationCriteriaDataAccessor$v1(this.tokenManagerSrv);
        this.setting = new NotificationSettingDataAccessor$v1(this.tokenManagerSrv);
    }
}
