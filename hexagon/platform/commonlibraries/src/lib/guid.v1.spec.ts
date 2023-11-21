import test from 'ava';

import { Guid } from './guid.v1';

test('Should create new guid', (t) => {
  t.is(!!Guid.NewGuid(), true);
});

test('Guid should be different', (t) => {
  t.not(Guid.NewGuid(), Guid.NewGuid());
})