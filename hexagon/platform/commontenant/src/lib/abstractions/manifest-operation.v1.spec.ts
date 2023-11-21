import test from 'ava';

import { ManifestOperation$v1 } from './manifest-operation.v1';

test('Manifest operation should have undefined properties', (t) => {
    // Arrange, Act
    const operation = new ManifestOperation$v1();

    // Assert
    t.is(operation.capabilityOperationId, undefined);
    t.is(operation.licenseFeatureId, undefined);
});

test('Manifest operation should have values', (t) => {
    // Arrange, Act
    const operation = new ManifestOperation$v1({
        capabilityOperationId: 'capabilityOperationId',
        licenseFeatureId: 'licenseFeatureId'
    });

    // Assert
    t.is(operation.capabilityOperationId, 'capabilityOperationId');
    t.is(operation.licenseFeatureId, 'licenseFeatureId');
});
