import test from 'ava';

import { Application$v1 } from './application.v1';

test('Application should have null properties', (t) => {
    // Arrange, Act
    const application = new Application$v1();

    // Assert
    t.is(application.id, null);
    t.is(application.nameToken, null);
    t.is(application.descriptionToken, null);
    t.is(application.featureId, null);
    t.is(application.licensePriority, 0);
});

test('Application should have values', (t) => {
    // Arrange, Act
    const application = new Application$v1({
        id: 'id',
        nameToken: 'nameToken',
        descriptionToken: 'descriptionToken',
        featureId: 'featureId',
        licensePriority: 1
    });

    // Assert
    t.is(application.id, 'id');
    t.is(application.nameToken, 'nameToken');
    t.is(application.descriptionToken, 'descriptionToken');
    t.is(application.featureId, 'featureId');
    t.is(application.licensePriority, 1);
});
