import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { is2Byte } from "./string.ts";

// ┌┐├┤╭╮╰╯└┘│─…'.
Deno.test("is2Byte() given numbers", () => {
  {
    const actual = is2Byte("2");
    const expected = false;
    assertEquals(actual, expected);
  }
  {
    const actual = is2Byte("6");
    const expected = false;
    assertEquals(actual, expected);
  }
});

Deno.test("is2Byte() given alphabets", () => {
  {
    const actual = is2Byte("b");
    const expected = false;
    assertEquals(actual, expected);
  }
  {
    const actual = is2Byte("j");
    const expected = false;
    assertEquals(actual, expected);
  }
});

Deno.test("is2Byte() given '...'", () => {
  const actual = is2Byte("...");
  const expected = false;
  assertEquals(actual, expected);
});

Deno.test("is2Byte() given some ruled lines and so on", () => {
  {
    const actual = is2Byte("...");
    const expected = false;
    assertEquals(actual, expected);
  }
});
