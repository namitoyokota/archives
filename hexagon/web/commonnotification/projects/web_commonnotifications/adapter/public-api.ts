/*
* Public API Surface of commonnotifications-adapter
*/

export * from './lib/adapter.module';
export * from './lib/adapter.v1.service';
export * from './lib/notification-btn/notification-btn.module';
export * from './lib/notification-btn/notification-btn.component';

export {
    capabilityId,
    Claims,
    AppNotification$v1,
    AppNotificationService$v1
} from '@galileo/web_commonnotifications/_common';
