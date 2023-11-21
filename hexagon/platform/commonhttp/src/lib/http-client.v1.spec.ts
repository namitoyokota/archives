import test from 'ava';
import axios from 'axios';
import sinon from 'sinon';

import { HttpClient$v1 } from './http-client.v1';
import { TokenManager$v1 } from './token-manager.v1';

class Response {
    id: string;
    value: string;
}

test('Get should return data', async (t) => {
    // Arrange, Act
    const tokenManager = new TokenManager$v1();
    tokenManager.setToken('token', 86400);

    const http = new HttpClient$v1(tokenManager);
    sinon.stub(axios, "get").resolves({
        data: {
            id: 'foo',
            value: 'bar'
        } as Response
    });

    // Assert
    await http.get<Response>('endpoint')
        .toPromise()
        .then(entity => {
            t.deepEqual((entity as Response).value, 'bar');
        })
        .catch(() => {
            t.fail();
        });
});

test('Delete should return data', async (t) => {
    // Arrange, Act
    const tokenManager = new TokenManager$v1();
    tokenManager.setToken('token', 86400);

    const http = new HttpClient$v1(tokenManager);
    sinon.stub(axios, "delete").resolves({
        data: {
            id: 'foo',
            value: 'bar'
        } as Response
    });

    // Assert
    await http.delete<Response>('endpoint')
        .toPromise()
        .then(entity => {
            t.deepEqual((entity as Response).value, 'bar');
        })
        .catch(() => {
            t.fail();
        });
});

test('Put should return data', async (t) => {
    // Arrange, Act
    const tokenManager = new TokenManager$v1();
    tokenManager.setToken('token', 86400);

    const http = new HttpClient$v1(tokenManager);
    sinon.stub(axios, "put").resolves({
        data: {
            id: 'foo',
            value: 'bar'
        } as Response
    });

    // Assert
    await http.put<Response>('endpoint', null)
        .toPromise()
        .then(entity => {
            t.deepEqual((entity as Response).value, 'bar');
        })
        .catch(() => {
            t.fail();
        });
});

test('Post should return data', async (t) => {
    // Arrange, Act
    const tokenManager = new TokenManager$v1();
    tokenManager.setToken('token', 86400);

    const http = new HttpClient$v1(tokenManager);
    sinon.stub(axios, "post").resolves({
        data: {
            id: 'foo',
            value: 'bar'
        } as Response
    });

    // Assert
    await http.post<Response>('endpoint', null)
        .toPromise()
        .then(entity => {
            t.deepEqual((entity as Response).value, 'bar');
        })
        .catch(() => {
            t.fail();
        });
});

test('Patch should return data', async (t) => {
    // Arrange, Act
    const tokenManager = new TokenManager$v1();
    tokenManager.setToken('token', 86400);

    const http = new HttpClient$v1(tokenManager);
    sinon.stub(axios, "patch").resolves({
        data: {
            id: 'foo',
            value: 'bar'
        } as Response
    });

    // Assert
    await http.patch<Response>('endpoint', null)
        .toPromise()
        .then(entity => {
            t.deepEqual((entity as Response).value, 'bar');
        })
        .catch(() => {
            t.fail();
        });
});