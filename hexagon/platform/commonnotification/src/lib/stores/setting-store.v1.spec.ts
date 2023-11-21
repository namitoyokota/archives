import test from 'ava';
import { first } from 'rxjs/operators';

import { NotificationSettings$v1 } from '../abstractions/notification-settings.v1';
import { NotificationSettingsStore$v1 } from '../stores/setting-store.v1';

test('Store should be empty', async (t) => {
    // Arrange, Act
    const store = new NotificationSettingsStore$v1();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should have a value', async (t) => {
    // Arrange
    const store = new NotificationSettingsStore$v1();

    // Act
    store.upsert([new NotificationSettings$v1({
        preset: 'id'
    } as NotificationSettings$v1)]);

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list[0].preset, 'id');
    });
});

test('Store should replace existing value', async (t) => {
    // Arrange
    const store = new NotificationSettingsStore$v1();

    // Act
    store.upsert([new NotificationSettings$v1({
        preset: 'id'
    } as NotificationSettings$v1)]);

    store.upsert([new NotificationSettings$v1({
        preset: 'id'
    } as NotificationSettings$v1)]);

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 1);
    });
});

test('Store should empty after clear', async (t) => {
    // Arrange
    const store = new NotificationSettingsStore$v1();

    // Act
    store.upsert([new NotificationSettings$v1({
        preset: 'id'
    } as NotificationSettings$v1)]);

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
    const store = new NotificationSettingsStore$v1();

    // Act
    store.upsert([new NotificationSettings$v1({
        preset: 'id'
    } as NotificationSettings$v1)]);

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
    const store = new NotificationSettingsStore$v1();

    // Act
    store.upsert([new NotificationSettings$v1({
        preset: 'id',
        presetName: 'name'
    } as NotificationSettings$v1)]);

    // Assert
    t.is(store.snapshot('id')?.presetName, 'name');
});