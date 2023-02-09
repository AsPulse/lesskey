import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';
import { uiString } from '../tui/string.ts';

export class StatusBar implements TUIComponent {
  constructor(public parent: TUIParent) {}

  id: null | string = null;
  text = '';

  async setId(id: string) {
    this.id = id;
    await this.parent.render();
  }

  async setText(content: string) {
    this.text = content;
    await this.parent.render();
  }

  render(area: TUIArea) {
    const howToQuit = uiString(
      [{ text: '(Ctrl+C to quit)', foregroundColor: [100, 100, 100] }],
      area.w,
      true,
    );

    const username = uiString(
      [{
        text: this.id === null
          ? ' LessKey '
          : ` LessKey [@${this.id}] `,
        backgroundColor: [255, 56, 139],
        foregroundColor: [255, 255, 255],
        bold: true,
      }],
      area.w,
      true,
    );

    return Promise.resolve([
      {
        x: area.x,
        y: area.h - area.y - 1,
        z: 11,
        content: [username],
      },
      {
        x: area.w - area.x - howToQuit.length - 1,
        y: area.h - area.y - 1,
        z: 12,
        content: [howToQuit],
      },
      {
        x: area.x + username.length + 1,
        y: area.h - area.y - 1,
        z: 11,
        content: [uiString([{ text: this.text }], area.w, true)],
      },
      {
        x: area.x,
        y: area.h - area.y - 1,
        z: 10,
        content: [uiString([{ text: ' '.repeat(area.w) }], area.w, true)],
      },
    ]);
  }
}
