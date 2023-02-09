import { assertEquals } from 'std/testing/asserts.ts';
import { formatTimespan, is2Byte } from './string.ts';

Deno.test('is2Byte() given numbers', () => {
  const actual = is2Byte('2');
  const expected = false;
  assertEquals(actual, expected);

  const actual2 = is2Byte('6');
  const expected2 = false;
  assertEquals(actual2, expected2);
});

Deno.test('is2Byte() given alphabets', () => {
  const actual = is2Byte('b');
  const expected = false;
  assertEquals(actual, expected);

  const actual2 = is2Byte('j');
  const expected2 = false;
  assertEquals(actual2, expected2);
});

Deno.test('is2Byte() given \'...\'', () => {
  const actual = is2Byte('...');
  const expected = false;
  assertEquals(actual, expected);
});

Deno.test('is2Byte() given some ruled lines and so on', () => {
  {
    const actual = is2Byte('┌');
    const expected = false;
    assertEquals(actual, expected);
  }
  {
    const actual = is2Byte('┐');
    const expected = false;
    assertEquals(actual, expected);
  }
  {
    const actual = is2Byte('♻️');
    const expected = false;
    assertEquals(actual, expected);
  }
});

Deno.test('formatTimeSpan() given future time', () => {
  assertEquals(
    formatTimespan(
      new Date('2023-02-09T01:01:30.167Z'),
      new Date(1675904481000),
    ),
    'Future',
  );
});

Deno.test('formatTimeSpan() given just-now time', () => {
  assertEquals(
    formatTimespan(
      new Date('2023-02-09T01:02:30.400Z'),
      new Date(1675904554000),
    ),
    'Just now',
  );
  assertEquals(
    formatTimespan(
      new Date('2023-02-09T01:05:04.571Z'),
      new Date(1675904713000),
    ),
    'Just now',
  );
});

Deno.test('formatTimeSpan() given seconds-order time', () => {
  assertEquals(
    formatTimespan(
      new Date('2023-02-09T01:08:25.456Z'),
      new Date(1675904917000),
    ),
    '12s ago',
  );
});
