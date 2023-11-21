import test from 'ava';

import { Coordinates$v1 } from './coordinates.v1';

test('Should have null properties', (t) => {
    // Arrange, Act
    const coordinates = new Coordinates$v1();

    // Assert
    t.is(coordinates.latitude, null);
    t.is(coordinates.longitude, null);
    t.is(coordinates.altitude, null);
});

test('Should have values', (t) => {
    // Arrange, Act
    const coordinates = new Coordinates$v1({
        latitude: '0',
        longitude: '0',
        altitude: '0'
    });

    // Assert
    t.is(coordinates.latitude, '0');
    t.is(coordinates.longitude, '0');
    t.is(coordinates.altitude, '0');
});
