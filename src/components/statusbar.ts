import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';
import { keyboard } from '../tui/keyboard.ts';

export class StatusBar implements TUIComponent {

  key = '';

  constructor(public parent: TUIParent){
    keyboard.onPress(buf => {
      // deno-lint-ignore no-control-regex
      this.key = `${buf} -> ${new TextDecoder().decode(buf).replace(/\x00+$/, '')}`;
      this.parent.render();
    });
  }

  render(area: TUIArea) {
    return Promise.resolve([
      {
        x: 0,
        y: area.h - area.y - 1,
        z: 5,
        content: [
          `width: ${area.w}, height: ${area.h}, keyboard: ${this.key}`.split('')
        ]
      },
    ]);
  }
}
