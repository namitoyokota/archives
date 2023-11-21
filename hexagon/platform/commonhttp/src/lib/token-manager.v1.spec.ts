import test from 'ava';
import { first } from 'rxjs/operators';

import { TokenManager$v1 } from './token-manager.v1';

test('Should have null token', async (t) => {
    // Arrange, Act
    const tokenManager = new TokenManager$v1();

    // Assert
    await tokenManager.authenticationToken$.pipe(
        first()
    ).subscribe(currentToken => {
        t.is(currentToken, null);
    });
});

test('Should have token', async (t) => {
    // Arrange
    const tokenName = 'foo';
    const tokenManager = new TokenManager$v1();

    // Act
    tokenManager.setToken(tokenName, 86400);

    // Assert
    await tokenManager.authenticationToken$.pipe(
        first()
    ).subscribe(currentToken => {
        t.is(currentToken, tokenName);
    });
});

test('Should have token cleared', async (t) => {
    // Arrange
    const tokenName = 'foo';
    const tokenManager = new TokenManager$v1();

    // Act
    tokenManager.setToken(tokenName, 86400);
    tokenManager.clearToken();

    // Assert
    await tokenManager.authenticationToken$.pipe(
        first()
    ).subscribe(currentToken => {
        t.is(currentToken, null);
    });
});