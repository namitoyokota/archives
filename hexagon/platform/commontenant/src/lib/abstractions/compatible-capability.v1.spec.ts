import test from 'ava';

import { CompatibleCapability$v1 } from './compatible-capability.v1';
import { CompatibleOptions$v1 } from './compatible-options.v1';

test('Compatible capability should have null properties', (t) => {
    // Arrange, Act
    const capability = new CompatibleCapability$v1();

    // Assert
    t.is(capability.capabilityId, null);
    t.is(capability.options, null);
});

test('Compatible capability should have values', (t) => {
    // Arrange, Act
    const capability = new CompatibleCapability$v1({
        capabilityId: 'capabilityId',
        options: [new CompatibleOptions$v1()]
    });

    // Assert
    t.is(capability.capabilityId, 'capabilityId');
    t.deepEqual(capability.options, [new CompatibleOptions$v1()]);
});
