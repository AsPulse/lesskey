import { TUIArea, TUIComponent, TUIParent } from "../tui/index.ts";
import { uiString } from "../tui/string.ts";

export class Message implements TUIComponent {
  constructor(public parent: TUIParent) {}

  private text: string[] = [];

  async setText(newValue: string[]) {
    this.text = newValue;
    await this.parent.render();
  }

  render(area: TUIArea) {
    const str = this.text.flatMap((v) =>
      uiString([{ text: v }], area.w, false)
    );

    return Promise.resolve([
      {
        x: Math.floor(
          (area.w -
            str.map((v) => v.length).reduce((a, b) => a > b ? a : b, 0)) / 2,
        ),
        y: Math.floor((area.h - str.length) / 2),
        z: 1,
        content: str,
      },
    ]);
  }
}
