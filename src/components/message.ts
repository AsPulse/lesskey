import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';
import { uiString } from '../tui/string.ts';

export class Message implements TUIComponent {

  constructor(public parent: TUIParent){}

  private text = '';

  setText(newValue: string) {
    this.text = newValue;
    this.parent.render();
  }

  render(area: TUIArea) {
    const str = uiString([{ text: this.text }]);

    return Promise.resolve([
      {
        x: Math.floor((area.w - str.length) / 2),
        y: Math.floor(area.h / 2),
        z: 1,
        content: [str]
      },
    ]);
  }
}
