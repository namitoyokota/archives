import test from 'ava';

import { Industries$v1 } from './industries.v1';

test('Industry should have undefined properties', (t) => {
    // Arrange, Act
    const industry = new Industries$v1();

    // Assert
    t.is(industry.iconUrl, undefined);
    t.is(industry.id, undefined);
    t.is(industry.nameToken, undefined);
    t.is(industry.sectorToken, undefined);
    t.is(industry.tenantId, undefined);
});

test('Industry should have values', (t) => {
    // Arrange, Act
    const industry = new Industries$v1({
        iconUrl: 'iconUrl',
        id: 'id',
        nameToken: 'nameToken',
        sectorToken: 'sectorToken',
        tenantId: 'tenantId'
    });

    // Assert
    t.is(industry.iconUrl, 'iconUrl');
    t.is(industry.id, 'id');
    t.is(industry.nameToken, 'nameToken');
    t.is(industry.sectorToken, 'sectorToken');
    t.is(industry.tenantId, 'tenantId');
});
