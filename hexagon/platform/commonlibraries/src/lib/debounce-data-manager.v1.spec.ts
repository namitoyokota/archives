import test from 'ava';

import { DebounceDataManager$v1 } from './debounce-data-manager.v1';

class Notification {
    id: string;
    value: string;

    constructor(params: Notification = {} as Notification) {
        const { id = null, value: name = null } = params;
        this.id = id;
        this.value = name;
    }
};

class DebounceManager extends DebounceDataManager$v1<Notification> {
    constructor() {
        super();
    }
}

test('Adding debounce should not fail', async (t) => {
    // Arrange
    const debounceManager = new DebounceManager();

    // Act
    debounceManager.debounce({
        id: 'foo',
        value: 'bar'
    } as Notification)

    // Assert
    t.pass();
});