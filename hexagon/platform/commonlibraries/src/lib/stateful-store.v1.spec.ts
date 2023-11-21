import test from 'ava';
import { first } from 'rxjs/operators';

import { StatefulStore$v1 } from './stateful-store.v1';

class Entity {
    id: string;
    value: string;

    constructor(params: Entity = {} as Entity) {
        const { id = null, value: name = null } = params;
        this.id = id;
        this.value = name;
    }
};

class StatefulStore extends StatefulStore$v1<Entity> {
    constructor() {
        super('id', Entity);
    }

    protected isEqual(source: Entity, entity: Entity): boolean {
        return source.id === entity.id;
    }
}

test('Store should be empty', async (t) => {
    // Arrange, Act
    const store = new StatefulStore();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 0);
    });
});

test('Store should have values', async (t) => {
    // Arrange
    const store = new StatefulStore();

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
    const store = new StatefulStore();

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

test('Store should be empty after remove', async (t) => {
    // Arrange
    const store = new StatefulStore();

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

test('Store should find entity', async (t) => {
    // Arrange
    const store = new StatefulStore();

    // Act
    store.upsert({
        id: 'foo',
        value: 'bar'
    } as Entity);

    // Assert
    t.is(store.snapshot('foo')?.value, 'bar');
});

test('Store should have values from source', async (t) => {
    // Arrange
    const store = new StatefulStore();

    // Act
    store.setSource([{
        id: 'foo',
        value: 'bar'
    } as Entity]);

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 1);
    });
});

test('Store should have original values', async (t) => {
    // Arrange
    const store = new StatefulStore();

    // Act
    store.setSource([{
        id: 'foo',
        value: 'bar'
    } as Entity]);
    store.upsert({ id: 'id' } as Entity);
    store.discardChanges();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 1);
    });
});

test('Store should update source', async (t) => {
    // Arrange
    const store = new StatefulStore();

    // Act
    store.setSource([{
        id: 'foo',
        value: 'bar'
    } as Entity]);
    store.upsert({ id: 'id' } as Entity);
    store.commit(['id']);
    store.discardChanges();

    // Assert
    await store.entity$.pipe(
        first()
    ).subscribe(list => {
        t.is(list.length, 2);
    });
});