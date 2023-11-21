import test from 'ava';

import { AppNotificationSettings$v1 } from './app-notification-settings.v1';
import { AppNotification$v1 } from './app-notification.v1';

test('App notification should have null properties', (t) => {
    // Arrange, Act
    const notification = new AppNotification$v1();

    // Assert
    t.is(notification.name, null);
    t.is(notification.id, null);
    t.is(notification.capabilityId, null);
    t.is(notification.tenantId, null);
    t.deepEqual(notification.uiSettings, new AppNotificationSettings$v1());
    t.is(notification.notificationType, null);
    t.is(notification.notificationSubtype, null);
    t.is(notification.systemCorrelationId, null);
    t.is(notification.hasBeenSeen, false);
    t.is(notification.toastDisplayed, false);
    t.is(notification.timestamp, null);
    t.is(notification.data, null);
    t.is(notification.flagged, false);
});

test('App notification should have values', (t) => {
    // Arrange, Act
    const notification = new AppNotification$v1<string, string>({
        name: 'name',
        id: 'id',
        capabilityId: 'capabilityId',
        tenantId: 'tenantId',
        timestamp: new Date(2022, 1, 1),
        uiSettings: new AppNotificationSettings$v1(),
        notificationType: 'notificationType',
        notificationSubtype: 'notificationSubtype',
        systemCorrelationId: 'systemCorrelationId',
        hasBeenSeen: true,
        toastDisplayed: true,
        groupId: 'GroupId',
        data: 'data',
        flagged: true
    });

    // Assert
    t.is(notification.name, 'name');
    t.is(notification.id, 'id');
    t.is(notification.capabilityId, 'capabilityId');
    t.is(notification.tenantId, 'tenantId');
    t.deepEqual(notification.timestamp, new Date(2022, 1, 1));
    t.deepEqual(notification.uiSettings, new AppNotificationSettings$v1());
    t.is(notification.notificationType, 'notificationType');
    t.is(notification.notificationSubtype, 'notificationSubtype');
    t.is(notification.systemCorrelationId, 'systemCorrelationId',);
    t.is(notification.hasBeenSeen, true);
    t.is(notification.toastDisplayed, true);
    t.is(notification.groupId, 'capabilityId;notificationType;')
    t.is(notification.data, 'data');
    t.is(notification.flagged, true);
});
