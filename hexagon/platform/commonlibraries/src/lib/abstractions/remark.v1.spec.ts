import test from 'ava';

import { PostStyle$v1 } from './post-style.v1';
import { Remark$v1 } from './remark.v1';

test('Should have null properties', (t) => {
    // Arrange, Act
    const remark = new Remark$v1();

    // Assert
    t.is(remark.authorFirstName, null);
    t.is(remark.authorMiddleName, null);
    t.is(remark.authorLastName, null);
    t.is(remark.text, null);
    t.is(remark.createdTime, null);
    t.is(remark.priority, PostStyle$v1.normal);
});

test('Should have values', (t) => {
    // Arrange, Act
    const remark = new Remark$v1({
        authorFirstName: 'authorFirstName',
        authorMiddleName: 'authorMiddleName',
        authorLastName: 'authorLastName',
        text: 'text',
        createdTime: new Date(2022, 1, 1),
        priority: PostStyle$v1.highPriority
    });

    // Assert
    t.is(remark.authorFirstName, 'authorFirstName');
    t.is(remark.authorMiddleName, 'authorMiddleName');
    t.is(remark.authorLastName, 'authorLastName');
    t.is(remark.text, 'text');
    t.deepEqual(remark.createdTime, new Date(2022, 1, 1));
    t.is(remark.priority, PostStyle$v1.highPriority);
});
