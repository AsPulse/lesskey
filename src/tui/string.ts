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

    return v.text.split('').map(s => `${before}${s}\x1b[0m`);
  });
}
