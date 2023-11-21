import test from 'ava';

import { MapData$v1 } from './map-data.v1';

test('Map data should have null properties', (t) => {
    // Arrange, Act
    const map = new MapData$v1();

    // Assert
    t.is(map.centerLatitude, null);
    t.is(map.centerLongitude, null);
    t.is(map.centerAltitude, null);
    t.is(map.zoomLevel, null);
});

test('Map data should have values', (t) => {
    // Arrange, Act
    const map = new MapData$v1({
        centerLatitude: 'centerLatitude',
        centerLongitude: 'centerLongitude',
        centerAltitude: 'centerAltitude',
        zoomLevel: 'zoomLevel'
    });

    // Assert
    t.is(map.centerLatitude, 'centerLatitude');
    t.is(map.centerLongitude, 'centerLongitude');
    t.is(map.centerAltitude, 'centerAltitude');
    t.is(map.zoomLevel, 'zoomLevel');
});
