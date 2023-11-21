import test from 'ava';

import { RestrictionGrouping$v1 } from './restriction-grouping.v1';

test('Restriction grouping should have null properties', (t) => {
    // Arrange, Act
    const grouping = new RestrictionGrouping$v1<string, string>();

    // Assert
    t.is(grouping.dataSharingLevel, null);
    t.deepEqual(grouping.restrictions, []);
});

test('Restriction grouping should have values', (t) => {
    // Arrange, Act
    const grouping = new RestrictionGrouping$v1<string, string>({
        dataSharingLevel: 'dataSharingLevel',
        restrictions: []
    });

    // Assert
    t.is(grouping.dataSharingLevel, 'dataSharingLevel');
    t.deepEqual(grouping.restrictions, []);
});
