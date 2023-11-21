import test from 'ava';

import { Hyperlink$v1 } from './hyperlink.v1';

test('Should have null properties', (t) => {
    // Arrange, Act
    const hyperlink = new Hyperlink$v1();

    // Assert
    t.is(hyperlink.text, null);
    t.is(hyperlink.href, null);
});

test('Should have values', (t) => {
    // Arrange, Act
    const hyperlink = new Hyperlink$v1({
        text: 'Google',
        href: 'https://google.com'
    });

    // Assert
    t.is(hyperlink.text, 'Google');
    t.is(hyperlink.href, 'https://google.com');
});
