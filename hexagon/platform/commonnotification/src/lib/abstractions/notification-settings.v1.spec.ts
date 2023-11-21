import test from 'ava';

import { NotificationSettings$v1 } from './notification-settings.v1';

test('Notification grouping should have null properties', (t) => {
    // Arrange, Act
    const filter = new NotificationSettings$v1();

    // Assert
    t.is(filter.etag, null);
    t.is(filter.tenantId, null);
    t.is(filter.preset, null);
    t.is(filter.presetName, null);
    t.is(filter.isDefault, false);
    t.deepEqual(filter.defaultGroups, []);
    t.is(filter.maxToDisplay, null);
    t.is(filter.overlapProtectionEnabled, true);
    t.is(filter.description, null);
    t.deepEqual(filter.disabledCapabilities, []);
});

test('Notification grouping should have values', (t) => {
    // Arrange, Act
    const filter = new NotificationSettings$v1({
        etag: 'etag',
        tenantId: 'tenantId',
        preset: 'preset',
        presetName: 'presetName',
        isDefault: true,
        defaultGroups: ['defaultGroup'],
        maxToDisplay: 5,
        overlapProtectionEnabled: false,
        description: 'description',
        disabledCapabilities: ['disabledCapability']
    });

    // Assert
    t.is(filter.etag, 'etag');
    t.is(filter.tenantId, 'tenantId');
    t.is(filter.preset, 'preset');
    t.is(filter.presetName, 'presetName');
    t.is(filter.isDefault, true);
    t.deepEqual(filter.defaultGroups, ['defaultGroup']);
    t.is(filter.maxToDisplay, 5);
    t.is(filter.overlapProtectionEnabled, false);
    t.is(filter.description, 'description');
    t.deepEqual(filter.disabledCapabilities, ['disabledCapability']);
});
