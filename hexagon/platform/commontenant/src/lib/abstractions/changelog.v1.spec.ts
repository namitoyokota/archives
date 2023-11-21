import test from 'ava';

import { ChangelogOperation$v1 } from './changelog-operation.v1';
import { Changelog$v1 } from './changelog.v1';

test('Changelog should have null properties', (t) => {
    // Arrange, Act
    const changelog = new Changelog$v1();

    // Assert
    t.is(changelog.user, null);
    t.is(changelog.tenant, null);
    t.is(changelog.timestamp, null);
    t.deepEqual(changelog.operations, []);
});

test('Changelog should have values', (t) => {
    // Arrange, Act
    const changelog = new Changelog$v1({
        user: 'user',
        tenant: 'tenant',
        timestamp: 'timestamp',
        operations: [new ChangelogOperation$v1()]
    });

    // Assert
    t.is(changelog.user, 'user');
    t.is(changelog.tenant, 'tenant');
    t.is(changelog.timestamp, 'timestamp');
    t.deepEqual(changelog.operations, [new ChangelogOperation$v1()]);
});
