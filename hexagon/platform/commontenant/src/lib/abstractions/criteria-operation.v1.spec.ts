import test from 'ava';

import { CriteriaOperation$v1 } from './criteria-operation.v1';

test('Criteria operation should have null properties', (t) => {
    // Arrange, Act
    const operation = new CriteriaOperation$v1();

    // Assert
    t.is(operation.capabilityOperationId, undefined);
    t.is(operation.enabled, false);
});

test('Criteria operation should have values', (t) => {
    // Arrange, Act
    const operation = new CriteriaOperation$v1({
        capabilityOperationId: 'capabilityOperationId',
        enabled: true
    });

    // Assert
    t.is(operation.capabilityOperationId, 'capabilityOperationId');
    t.is(operation.enabled, true);
});
