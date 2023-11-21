import test from 'ava';

import { Telemetry$v1 } from './telemetry.v1';

test('Should have null properties', (t) => {
    // Arrange, Act
    const telemetry = new Telemetry$v1();

    // Assert
    t.is(telemetry.timestamp, null);
    t.is(telemetry.unitsOfMeasure, null);
    t.is(telemetry.value, null);
});

test('Should have values', (t) => {
    // Arrange, Act
    const telemetry = new Telemetry$v1({
        timestamp: new Date(2022, 1, 1),
        unitsOfMeasure: 'unitsOfMeasure',
        value: 'value',
    });

    // Assert
    t.deepEqual(telemetry.timestamp, new Date(2022, 1, 1));
    t.is(telemetry.unitsOfMeasure, 'unitsOfMeasure');
    t.is(telemetry.value, 'value');
});
