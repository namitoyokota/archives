import test from 'ava';

import { StatefulStore$v1 } from './stateful-store.v1';
import { TombstonedManager$v1 } from './tombstone-manager.v1';

const contextId = 'contextId';
const tenantId = 'tenantId';

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

class TombstonedManager extends TombstonedManager$v1<Entity> {
    constructor(
        testStatefulStore: StatefulStore
    ) {
        super(testStatefulStore);
    }

    getEntitiesAsync(): Promise<Entity[]> {
        return new Promise<Entity[]>(resolve => {
            resolve([
                {
                    id: 'foo',
                    value: 'foo'
                } as Entity,
                {
                    id: 'bar',
                    value: 'bar'
                } as Entity,
                {
                    id: 'foobar',
                    value: 'foobar'
                }
            ]);
        });
    }
}

test('Should have no locks', async (t) => {
    // Arrange, Act
    const store = new StatefulStore();
    const tombstonedManager = new TombstonedManager(store);

    // Assert
    t.is(tombstonedManager.isLocked('foo'), false);
    t.is(tombstonedManager.isLocked('bar'), false);
    t.is(tombstonedManager.isLocked('foobar'), false);
});

test('Entity should be locked', async (t) => {
    // Arrange
    const store = new StatefulStore();
    const tombstonedManager = new TombstonedManager(store);

    // Act
    await tombstonedManager.lockAsync(['foo', 'bar', 'foobar'], contextId, tenantId);

    // Assert
    t.is(tombstonedManager.isLocked('foo'), true);
    t.is(tombstonedManager.isLocked('bar'), true);
    t.is(tombstonedManager.isLocked('foobar'), true);
});

test('Entity should be all unlocked', async (t) => {
    // Arrange
    const store = new StatefulStore();
    const tombstonedManager = new TombstonedManager(store);

    // Act
    await tombstonedManager.lockAsync(['foo', 'bar', 'foobar'], contextId, tenantId);
    tombstonedManager.release(contextId);

    // Assert
    t.is(tombstonedManager.isLocked('foo'), false);
    t.is(tombstonedManager.isLocked('bar'), false);
    t.is(tombstonedManager.isLocked('foobar'), false);
});