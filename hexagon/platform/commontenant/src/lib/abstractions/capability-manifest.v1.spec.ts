import test from 'ava';

import { CapabilityManifest$v1, defaultDataSharingLevels } from './capability-manifest.v1';
import { CompatibleCapability$v1 } from './compatible-capability.v1';
import { ManifestOperation$v1 } from './manifest-operation.v1';

test('Capability Manifest should have null properties', (t) => {
    // Arrange, Act
    const capability = new CapabilityManifest$v1();

    // Assert
    t.is(capability.id, null);
    t.is(capability.etag, null);
    t.is(capability.uri, null);
    t.is(capability.nameToken, null);
    t.is(capability.descriptionToken, null);
    t.is(capability.dataSharingComponentType, null);
    t.is(capability.activeDataFiltersComponentType, null);
    t.deepEqual(capability.compatible, []);
    t.is(capability.dataSharingLevels, defaultDataSharingLevels);
    t.is(capability.hasPatSupport, false);
    t.deepEqual(capability.capabilityOperations, []);
    t.is(capability.supportsIconManagement, false);
    t.is(capability.excludeFromInternalDataSharing, true);
    t.is(capability.excludeFromExternalDataSharing, true);
    t.is(capability.isSharable, false);
});

test('Capability Manifest should have values', (t) => {
    // Arrange, Act
    const Capability = new CapabilityManifest$v1({
        id: 'id',
        etag: 'etag',
        uri: 'uri',
        nameToken: 'nameToken',
        descriptionToken: 'descriptionToken',
        dataSharingComponentType: 'dataSharingComponentType',
        activeDataFiltersComponentType: 'activeDataFiltersComponentType',
        compatible: [new CompatibleCapability$v1()],
        dataSharingLevels: ['dataSharingLevel'],
        hasPatSupport: true,
        capabilityOperations: [new ManifestOperation$v1()],
        supportsIconManagement: true,
        excludeFromInternalDataSharing: true,
        excludeFromExternalDataSharing: true,
        isSharable: true
    });

    // Assert
    t.is(Capability.id, 'id');
    t.is(Capability.etag, 'etag');
    t.is(Capability.uri, 'uri');
    t.is(Capability.nameToken, 'nameToken');
    t.is(Capability.descriptionToken, 'descriptionToken');
    t.is(Capability.dataSharingComponentType, 'dataSharingComponentType');
    t.is(Capability.activeDataFiltersComponentType, 'activeDataFiltersComponentType');
    t.deepEqual(Capability.compatible, [new CompatibleCapability$v1()]);
    t.deepEqual(Capability.dataSharingLevels, ['dataSharingLevel']);
    t.is(Capability.hasPatSupport, true);
    t.deepEqual(Capability.capabilityOperations, [new ManifestOperation$v1()]);
    t.is(Capability.supportsIconManagement, true);
    t.is(Capability.excludeFromInternalDataSharing, true);
    t.is(Capability.excludeFromExternalDataSharing, true);
    t.is(Capability.isSharable, true);
});
