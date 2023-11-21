import test from 'ava';

import { AppNotificationSettings$v1 } from './app-notification-settings.v1';
import { NotificationFilter$v1 } from './notification-filter.v1';
import { NotificationGrouping$v1 } from './notification-grouping.v1';

test('Notification grouping should have null properties', (t) => {
    // Arrange, Act
    const filter = new NotificationGrouping$v1();

    // Assert
    t.deepEqual(filter.filters, []);
    t.is(filter.uiSettings, null);
});

test('Notification grouping should have values', (t) => {
    // Arrange, Act
    const filter = new NotificationGrouping$v1({
        filters: [new NotificationFilter$v1()],
        uiSettings: new AppNotificationSettings$v1(),
    });

    // Assert
    t.deepEqual(filter.filters, [new NotificationFilter$v1()]);
    t.deepEqual(filter.uiSettings, new AppNotificationSettings$v1());
});
