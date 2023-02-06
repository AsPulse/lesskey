import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';
import { keyboard } from '../tui/keyboard.ts';
import { uiString } from '../tui/string.ts';

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
    const howToQuit = uiString([{ text: '(Ctrl+C to quit)', foregroundColor: [100, 100, 100] }]);

    return Promise.resolve([
      {
        x: 0,
        y: area.h - area.y - 1,
        z: 5,
        content: [
          uiString([{ text: ' LessKey @misskey.io ', backgroundColor: [255, 56, 139], foregroundColor: [255, 255, 255], bold: true }])
        ]
      },
      {
        x: area.w - area.x - howToQuit.length - 1,
        y: area.h - area.y - 1,
        z: 5,
        content: [howToQuit]
      }
    ]);
  }
}
