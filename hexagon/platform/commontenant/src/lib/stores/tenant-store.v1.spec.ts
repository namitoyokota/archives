import test from 'ava';
import { first } from 'rxjs/operators';

import { Tenant$v1 } from '../abstractions/tenant.v1';
import { TenantStore$v1 } from '../stores/tenant-store.v1';

test('Store should be empty', async (t) => {
    // Arrange, Act
    const store = new TenantStore$v1();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should have a value', async (t) => {
    // Arrange
    const store = new TenantStore$v1();

    // Act
    store.upsert([new Tenant$v1({
        id: 'id'
    } as Tenant$v1)]);

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list[0].id, 'id');
    });
});

test('Store should replace existing value', async (t) => {
    // Arrange
    const store = new TenantStore$v1();

    // Act
    store.upsert([new Tenant$v1({
        id: 'id'
    } as Tenant$v1)]);

    store.upsert([new Tenant$v1({
        id: 'id'
    } as Tenant$v1)]);

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 1);
    });
});

test('Store should empty after clear', async (t) => {
    // Arrange
    const store = new TenantStore$v1();

    // Act
    store.upsert([new Tenant$v1({
        id: 'id'
    } as Tenant$v1)]);

    store.clear();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should empty after remove', async (t) => {
    // Arrange
    const store = new TenantStore$v1();

    // Act
    store.upsert([new Tenant$v1({
        id: 'id'
    } as Tenant$v1)]);

    store.remove('id');

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should get value', async (t) => {
    // Arrange
    const store = new TenantStore$v1();

    // Act
    store.upsert([new Tenant$v1({
        id: 'id',
        name: 'name'
    } as Tenant$v1)]);

    // Assert
    t.is(store.snapshot('id')?.name, 'name');
});