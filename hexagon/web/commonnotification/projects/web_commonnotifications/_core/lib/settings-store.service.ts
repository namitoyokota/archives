import { Injectable } from '@angular/core';
import { NotificationSettingsStore$v1 } from '@galileo/platform_commonnotifications';

@Injectable({
    providedIn: 'root'
})
export class SettingsStoreService extends NotificationSettingsStore$v1 {
    constructor() {
        super()
    }
}
