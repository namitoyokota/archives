import test from 'ava';

import { Coordinates$v1 } from './coordinates.v1';
import { Location$v1 } from './location.v1';

test('Should have null properties', (t) => {
    // Arrange, Act
    const location = new Location$v1();

    // Assert
    t.is(location.formattedAddress, null);
    t.is(location.coordinates, null);
    t.is(location.crossStreet1, null);
    t.is(location.crossStreet2, null);
});

test('Should have values', (t) => {
    // Arrange, Act
    const location = new Location$v1({
        formattedAddress: 'Formatted Address',
        coordinates: new Coordinates$v1({
            latitude: '0',
            longitude: '0',
            altitude: '0'
        }),
        crossStreet1: 'Cross Street 1',
        crossStreet2: 'Cross Street 2'
    });

    // Assert
    t.is(location.formattedAddress, 'Formatted Address');
    t.is(location.coordinates.latitude, '0');
    t.is(location.coordinates.longitude, '0');
    t.is(location.coordinates.altitude, '0');
    t.is(location.crossStreet1, 'Cross Street 1');
    t.is(location.crossStreet2, 'Cross Street 2');
});
