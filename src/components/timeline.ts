import { ChannelMessageEvent } from '../api.ts';
import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';
import { uiString } from '../tui/string.ts';

export class Timeline implements TUIComponent {

  constructor(public parent: TUIParent){}

  notes: ChannelMessageEvent[] = [];

  async addNote(note: ChannelMessageEvent) {
    this.notes.push(note);
    await this.parent.render();
  }

  render(area: TUIArea) {

    return Promise.resolve([
      ...[...this.notes].reverse().flatMap((v, i) => ([
        {
          x: area.x,
          y: area.y + 2 + i * 3,
          z: 1,
          content: [uiString([{ text: `@${v.body.body.user.username}` }])]
        },
        {
          x: area.x,
          y: area.y + 2 + i * 3 + 1,
          z: 1,
          content: [uiString([{ text: v.body.body.text.replace(/\n/g, '[\\n]') }])]
        },
        {
          x: area.x,
          y: area.y + 2 + i * 3 + 2,
          z: 1,
          content: [uiString([{ text: '' }])]
        }
      ])),
      {
        x: area.x,
        y: area.y,
        z: 2,
        content: [uiString([{ text: 'LOCAL TIMELINE', bold: true }])]
      }
    ]);
  }
}
