import test from 'ava';
import { first } from 'rxjs/operators';

import { Application$v1 } from '../abstractions/application.v1';

import { ApplicationStore$v1 } from './application-store.v1';

test('Store should be empty', async (t) => {
    // Arrange, Act
    const store = new ApplicationStore$v1();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should have a value', async (t) => {
    // Arrange
    const store = new ApplicationStore$v1();

    // Act
    store.upsert([new Application$v1({
        id: 'id'
    } as Application$v1)]);

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list[0].id, 'id');
    });
});
