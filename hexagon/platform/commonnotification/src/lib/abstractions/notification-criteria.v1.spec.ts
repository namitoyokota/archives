import test from 'ava';

import { NotificationCriteria$v1 } from './notification-criteria.v1';
import { NotificationGrouping$v1 } from './notification-grouping.v1';

test('Notification criteria should have null properties', (t) => {
    // Arrange, Act
    const criteria = new NotificationCriteria$v1();

    // Assert
    t.is(criteria.etag, null);
    t.is(criteria.tenantId, null);
    t.is(criteria.preset, null);
    t.is(criteria.capabilityId, null);
    t.is(criteria.notificationType, null);
    t.is(criteria.notificationSubtype, null);
    t.is(criteria.isEnabled, true);
    t.deepEqual(criteria.grouping, []);
});

test('Notification criteria should have values', (t) => {
    // Arrange, Act
    const criteria = new NotificationCriteria$v1({
        etag: 'etag',
        tenantId: 'tenantId',
        preset: 'preset',
        capabilityId: 'capabilityId',
        notificationType: 'notificationType',
        notificationSubtype: 'notificationSubtype',
        isEnabled: false,
        grouping: [new NotificationGrouping$v1()]
    });

    // Assert
    t.is(criteria.etag, 'etag');
    t.is(criteria.tenantId, 'tenantId');
    t.is(criteria.preset, 'preset');
    t.is(criteria.capabilityId, 'capabilityId');
    t.is(criteria.notificationType, 'notificationType');
    t.is(criteria.notificationSubtype, 'notificationSubtype');
    t.is(criteria.isEnabled, false);
    t.deepEqual(criteria.grouping, [new NotificationGrouping$v1()]);
});
