/*
* Public API Surface of commonnotifications/_common
*/

export * from './lib/app-notification.service.v1';
export * from './lib/claims.v1';
export * from './lib/common.mailbox';
export * from './lib/feature-flags';
export * from './lib/injection.tokens';
export * from './lib/translation-group';

export * from './lib/abstractions/app-notification-injection-request.v1';
export * from './lib/abstractions/app-notification-injection-response.v1';
export * from './lib/abstractions/app-notification-group.v1';
export * from './lib/abstractions/capability-settings.v1';

export {
    capabilityId,
    AppNotificationSettings$v1,
    AppNotification$v1,
    NotificationSettings$v1,
    NotificationCriteria$v1
} from '@galileo/platform_commonnotifications';