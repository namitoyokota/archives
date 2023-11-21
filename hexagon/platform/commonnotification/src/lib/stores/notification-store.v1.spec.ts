import test from 'ava';
import { first } from 'rxjs/operators';

import { AppNotification$v1 } from '../abstractions/app-notification.v1';
import { SortOptions$v1 } from '../abstractions/sort-options.v1';
import { NotificationStore$v1 } from '../stores/notification-store.v1';

test('Store should be empty', async (t) => {
    // Arrange, Act
    const store = new NotificationStore$v1();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should have a value', async (t) => {
    // Arrange
    const store = new NotificationStore$v1();

    // Act
    store.upsert(new AppNotification$v1({
        systemCorrelationId: 'id'
    } as AppNotification$v1<string, string>));

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list[0].systemCorrelationId, 'id');
    });
});

test('Store should replace existing value', async (t) => {
    // Arrange
    const store = new NotificationStore$v1();

    // Act
    store.upsert(new AppNotification$v1({
        systemCorrelationId: 'id'
    } as AppNotification$v1<string, string>));

    store.upsert(new AppNotification$v1({
        systemCorrelationId: 'id'
    } as AppNotification$v1<string, string>));

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 1);
    });
});

test('Store should be empty after clear', async (t) => {
    // Arrange
    const store = new NotificationStore$v1();

    // Act
    store.upsert(new AppNotification$v1({
        systemCorrelationId: 'id'
    } as AppNotification$v1<string, string>));

    store.clear();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should remove from list', async (t) => {
    // Arrange
    const store = new NotificationStore$v1();

    // Act
    store.upsert(new AppNotification$v1({
        systemCorrelationId: 'id'
    } as AppNotification$v1<string, string>));

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
    const store = new NotificationStore$v1();

    // Act
    store.upsert(new AppNotification$v1({
        systemCorrelationId: 'id',
        name: 'name'
    } as AppNotification$v1<string, string>));

    // Assert
    t.is(store.snapshot('id')?.name, 'name');
});

test('Filter should be null', async (t) => {
    // Arrange, Act
    const store = new NotificationStore$v1();

    // Assert
    await store.filterOptions$.pipe(
        first()
    ).subscribe(filters => {
        t.is(filters, null);
    });
});

test('Filter should have a value', async (t) => {
    // Arrange, Act
    const store = new NotificationStore$v1();

    store.setEnabledFilters(['filter']);

    // Assert
    await store.filterOptions$.pipe(
        first()
    ).subscribe(filters => {
        t.is(filters[0], 'filter');
    });
});

test('Option should be default', async (t) => {
    // Arrange, Act
    const store = new NotificationStore$v1();

    // Assert
    await store.sortOption$.pipe(
        first()
    ).subscribe(option => {
        t.is(option, SortOptions$v1.newestOnTop);
    });
});

test('Option should have value', async (t) => {
    // Arrange
    const store = new NotificationStore$v1();

    // Act
    store.setSortOption(SortOptions$v1.displayOrderAsc);

    // Assert
    await store.sortOption$.pipe(
        first()
    ).subscribe(option => {
        t.is(option, SortOptions$v1.displayOrderAsc);
    });
});