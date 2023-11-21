import test from 'ava';
import { first } from 'rxjs/operators';

import { Store$v1 } from './store.v1';

class Entity {
    id: string;
    value: string;

    constructor(params: Entity = {} as Entity) {
        const { id = null, value: name = null } = params;
        this.id = id;
        this.value = name;
    }
};

class Store extends Store$v1<Entity> {
    constructor() {
        super('id', Entity);
    }
}

test('Store should be empty', async (t) => {
    // Arrange, Act
    const store = new Store();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should have values', async (t) => {
    // Arrange
    const store = new Store();

    // Act
    store.upsert({
        id: 'foo',
        value: 'bar'
    } as Entity);

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 1);
    });
});

test('Store should be empty after clear', async (t) => {
    // Arrange
    const store = new Store();

    // Act
    store.upsert({
        id: 'foo',
        value: 'bar'
    } as Entity);
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
    const store = new Store();

    // Act
    store.upsert({
        id: 'foo',
        value: 'bar'
    } as Entity);
    store.remove('foo');

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should get value', async (t) => {
    // Arrange
    const store = new Store();

    // Act
    store.upsert({
        id: 'foo',
        value: 'bar'
    } as Entity);

    // Assert
    t.is(store.snapshot('foo')?.value, 'bar');
});
