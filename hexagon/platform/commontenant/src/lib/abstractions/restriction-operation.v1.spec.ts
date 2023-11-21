import { Guid } from '@galileo/platform_common-libraries';
import test from 'ava';

import { RestrictionOperation$v1 } from './restriction-operation.v1';

test('Restriction operation should have undefined properties', (t) => {
    // Arrange, Act
    const operation = new RestrictionOperation$v1();

    // Assert
    t.not(operation.id, Guid.NewGuid());
    t.is(operation.operationId, undefined);
    t.is(operation.content, undefined);
});

test('Restriction operation should have values', (t) => {
    // Arrange, Act
    const operation = new RestrictionOperation$v1({
        id: 'id',
        operationId: 'operationId',
        content: 'content'
    });

    // Assert
    t.not(operation.id, Guid.NewGuid());
    t.is(operation.operationId, 'operationId');
    t.is(operation.content, 'content');
});
