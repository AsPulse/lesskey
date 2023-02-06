import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';

export class StatusBar implements TUIComponent {
  constructor(public parent: TUIParent){}

  render(area: TUIArea) {
    return Promise.resolve([
      {
        x: 0,
        y: area.h - area.y - 1,
        z: 5,
        content: [
          `Hello, width: ${area.w}, height: ${area. h}`.split('')
        ]
      },
      ...[...Array(area.h - 1).keys()].map(v => ({
        x: 0,
        y: v,
        z: 5,
        content: [`${v}`.split('')]
      }))
    ]);
  }
}
