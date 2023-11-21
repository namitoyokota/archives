import test from 'ava';

import { Person$v1 } from './person.v1';

test('Should have null properties', (t) => {
    // Arrange, Act
    const person = new Person$v1();

    // Assert
    t.is(person.firstName, null);
    t.is(person.middleName, null);
    t.is(person.lastName, null);
    t.is(person.title, null);
    t.is(person.email, null);
    t.is(person.phone, null);
});

test('Should have values', (t) => {
    // Arrange, Act
    const person = new Person$v1({
        firstName: 'firstName',
        middleName: 'middleName',
        lastName: 'lastName',
        title: 'title',
        email: 'email',
        phone: 'phone'
    });

    // Assert
    t.is(person.firstName, 'firstName');
    t.is(person.middleName, 'middleName');
    t.is(person.lastName, 'lastName');
    t.is(person.title, 'title');
    t.is(person.email, 'email');
    t.is(person.phone, 'phone');
});
