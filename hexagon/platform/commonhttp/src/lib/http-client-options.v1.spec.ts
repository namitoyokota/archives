import test from 'ava';

import { HttpClientOptions$v1 } from './http-client-options.v1';

test('Should have empty options', async (t) => {
    // Arrange, Act
    const clientOptions = new HttpClientOptions$v1();

    // Assert
    t.deepEqual(clientOptions.httpOptions, {});
});

test('Should have token', async (t) => {
    // Arrange
    const tokenName = 'foo';
    const clientOptions = new HttpClientOptions$v1();

    // Act
    clientOptions.setStandardAuthentication(tokenName);

    // Assert
    t.is(clientOptions.httpOptions.headers.Authorization, 'Bearer ' + tokenName);
});

test('Should have values', async (t) => {
    // Arrange, Act
    const testParameter = 'foo';
    const clientOptions = new HttpClientOptions$v1({
        httpOptions: {
            params: { testParameter },
        }
    } as HttpClientOptions$v1);

    // Assert
    t.deepEqual(clientOptions.httpOptions.params, { testParameter });
});