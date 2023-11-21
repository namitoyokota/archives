import test from 'ava';

import { Media$v1 } from './media.v1';

test('Should have null properties', (t) => {
    // Arrange, Act
    const media = new Media$v1();

    // Assert
    t.is(media.id, null);
    t.is(media.externalId, null);
    t.is(media.contentType, null);
    t.is(media.contentLength, null);
    t.is(media.lastModifiedTime, null);
    t.is(media.name, null);
    t.is(media.fileName, null);
    t.is(media.isUploaded, false);
    t.is(media.url, null);
    t.is(media.entityId, null);
    t.is(media.uri, null);
    t.is(media.uriExpirationTime, null);
});

test('Should have values', (t) => {
    // Arrange, Act
    const media = new Media$v1({
        id: 'id',
        externalId: 'externalId',
        contentType: 'contentType',
        contentLength: 1,
        lastModifiedTime: new Date(2022, 1, 1),
        name: 'name',
        fileName: 'fileName',
        isUploaded: true,
        entityId: 'entityId',
        url: 'url',
        uri: 'uri',
        uriExpirationTime: 'uriExpirationTime'
    } as Media$v1);

    // Assert
    t.is(media.id, 'id');
    t.is(media.externalId, 'externalId');
    t.is(media.contentType, 'contentType');
    t.is(media.contentLength, 1);
    t.deepEqual(media.lastModifiedTime, new Date(2022, 1, 1));
    t.is(media.name, 'name');
    t.is(media.fileName, 'fileName');
    t.is(media.isUploaded, true);
    t.is(media.entityId, 'entityId');
    t.is(media.url, 'url');
    t.is(media.uri, 'uri');
    t.is(media.uriExpirationTime, 'uriExpirationTime');
});
