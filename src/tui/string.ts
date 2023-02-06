// deno-lint-ignore no-control-regex
export const is2Byte = (str: string) => str.match(/^[^\x01-\x7E\xA1-\xDF]+$/);

export function uiString(data: {
  text: string,
  foregroundColor?: [number, number, number],
  backgroundColor?: [number, number, number],
  bold?: boolean
}[]): string[] {
  return data.flatMap(v => {
    const before = [
      '\x1b[0m',
      v.foregroundColor === undefined ? '' : `\x1b[38;2;${v.foregroundColor.join(';')}m`,
      v.backgroundColor === undefined ? '' : `\x1b[48;2;${v.backgroundColor.join(';')}m`,
      v.bold === true ? '\x1b[1m' : ''
    ].join('');

    return v.text.split('').flatMap(s => 
      [`${before}${s}\x1b[0m`, ...(is2Byte(s) ? [''] : [])]
    );
  });
}
