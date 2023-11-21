import test from 'ava';

import { NotificationFilter$v1 } from './notification-filter.v1';

test('Notification filter should have null properties', (t) => {
    // Arrange, Act
    const filter = new NotificationFilter$v1();

    // Assert
    t.is(filter.operationId, null);
    t.is(filter.content, null);
});

test('Notification filter should have values', (t) => {
    // Arrange, Act
    const filter = new NotificationFilter$v1({
        operationId: 'operationId',
        content: 'content',
    });

    // Assert
    t.is(filter.operationId, 'operationId');
    t.is(filter.content, 'content');
});
