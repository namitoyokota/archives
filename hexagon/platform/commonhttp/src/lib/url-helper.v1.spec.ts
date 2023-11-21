import test from 'ava';

import { UrlHelper$v1 } from './url-helper.v1';

test('Should be invalid url', (t) => {
    // Arrange, Act
    const url = 'google.com';

    // Assert
    t.is(UrlHelper$v1.isValid(url), false);
});

test('Should be valid url', (t) => {
    // Arrange, Act
    const url = 'https://staging.hxgnconnect.com/webroot/';

    // Assert
    t.is(UrlHelper$v1.isValid(url), true);
});

test('Should be invalid email', (t) => {
    // Arrange, Act
    const email = 'admin@';

    // Assert
    t.is(UrlHelper$v1.isEmailValid(email), false);
});

test('Should be valid email', (t) => {
    // Arrange, Act
    const email = 'admin@safecities.xyz';

    // Assert
    t.is(UrlHelper$v1.isEmailValid(email), true);
});