import { ChannelMessageEvent } from '../api.ts';
import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';
import { uiString } from '../tui/string.ts';

type StatusType = { now: string, left: string | null, right: string | null, };

export class Timeline implements TUIComponent {

  constructor(public parent: TUIParent){}

  status: StatusType = { now: 'Local', left: 'Home', right: 'Social' };
  notes: ChannelMessageEvent[] = [];

  async addNote(note: ChannelMessageEvent) {
    this.notes.push(note);
    await this.parent.render();
  }

  async resetTimeline(newStatus: StatusType) {
    this.notes = [];
    this.status = newStatus;
    await this.parent.render();
  }


  render(area: TUIArea) {

    const now = uiString([{ text: `${this.status.now} TIMELINE`, bold: true }]);
    const left = uiString([{ text: `<[h] ${this.status.left}` }]);
    const right = uiString([{ text: `${this.status.right} [l]>` }]);

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
        x: area.x + (area.w - now.length) / 2,
        y: area.y,
        z: 3,
        content: [now]
      },
      {
        x: area.x,
        y: area.y,
        z: 2,
        content: this.status.left !== null ? [left] : []
      },
      {
        x: area.w - area.x - right.length - 1,
        y: area.y,
        z: 2,
        content: this.status.right !== null ? [right] : []
      }
    ]);
  }
}
