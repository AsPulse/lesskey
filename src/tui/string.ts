export const is2Byte = (str: string) =>
  '┌┐├┤╭╮╰╯└┘│─…'.includes(str)
    ? false // deno-lint-ignore no-control-regex
    : str.match(/^[^\x01-\x7E\xA1-\xDF]+$/) !== null;

export function uiString<T extends boolean>(
  data: {
    text: string;
    foregroundColor?: [number, number, number];
    backgroundColor?: [number, number, number];
    bold?: boolean;
  }[],
  width: number,
  oneLine: T,
): T extends true ? string[] : string[][] {
  const result: string[][] = [];
  let cache: string[] = [];

  data.forEach((v) => {
    const before = [
      '\x1b[0m',
      v.foregroundColor === undefined
        ? ''
        : `\x1b[38;2;${v.foregroundColor.join(';')}m`,
      v.backgroundColor === undefined
        ? ''
        : `\x1b[48;2;${v.backgroundColor.join(';')}m`,
      v.bold === true ? '\x1b[1m' : '',
    ].join('');

    v.text.split('').forEach((s) => {
      const bytes = is2Byte(s) ? 2 : 1;
      const content = `${before}${s}\x1b[0m`;
      if (cache.length + bytes > width) {
        while (cache.length <= width) {
          cache.push(' ');
        }
        result.push(cache);
        cache = [];
      }
      cache.push(...(bytes === 2 ? [content, ''] : [content]));
    });
  });

  result.push(cache);

  return (oneLine ? result[0] : result) as T extends true ? string[]
    : string[][];
}

export function formatTimespan(target: Date, now: Date = new Date()) {
  const span = now.getTime() - target.getTime();
  if (span < 0) return 'Future';
  if (span <= 10 * 1000) return 'Just now';
  if (span <= 60 * 1000) return `${Math.round(span / 1000)}s ago`;
  if (span <= 60 * 60 * 1000) return `${Math.round(span / 1000 / 60)}m ago`;
  if (span <= 24 * 60 * 60 * 1000) {
    return `${Math.round(span / 1000 / 60 / 60)}h ago`;
  }

  return `${Math.round(span / 1000 / 60 / 60 / 24)}d ago`;
}
