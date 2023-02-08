import { ChannelMessageEvent, MisskeyAPI } from '../api.ts';
import { TUIArea, TUIComponent, TUIParent } from '../tui/index.ts';
import { keyboard } from '../tui/keyboard.ts';
import { uiString } from '../tui/string.ts';

type StatusType = { now: string, left: string | null, right: string | null, };

const timelines = [
  { view: 'Home', id: 'homeTimeline' },
  { view: 'Local', id: 'localTimeline' },
  { view: 'Social', id: 'hybridTimeline' },
  { view: 'Global', id: 'globalTimeline' },
] as const;

export type TimelineId = number & (keyof typeof timelines);



export class Timeline implements TUIComponent {

  id: null | string = null;


  status: StatusType = { now: 'Loading', left: null, right: null };
  notes: ChannelMessageEvent[] = [];

  selectedNotes = -1;

  constructor(public parent: TUIParent, public api: MisskeyAPI){
    this.setActiveTimeline(1);
    keyboard.onPress(buf => {
      // Key H
      if(buf[0] === 104 && buf[1] === 0) {
        if(this.activeTimeline > 0) this.setActiveTimeline(this.activeTimeline - 1);
        return;
      }

      if(buf[0] === 108 && buf[1] === 0) {
        if(this.activeTimeline < timelines.length - 1) this.setActiveTimeline(this.activeTimeline + 1);
        return;
      }
    });
  }


  activeTimeline: TimelineId = 1;

  private async setActiveTimeline(index: TimelineId) {
    this.activeTimeline = index;
    if(this.id !== null) {
      await this.api.stopListenChannel(this.id);
    }
    const left = index === 0 ? null : timelines[index - 1].view;
    const right = index === timelines.length - 1 ? null : timelines[index + 1].view;

    this.status = { left, right, now: timelines[index].view };
    this.notes = [];
    this.id = `--lesskey-TL-${Date.now()}`;

    await this.parent.render();
    this.api.startListenChannel(timelines[index].id, this.id, e => this.addNote(e));

  }

  private async addNote(e: ChannelMessageEvent) {
    this.notes.unshift(e);
    // Keep a cache of the 100 most recent notes and the 10 surrounding notes that are in focus.
    this.notes = this.notes.filter((_, i) => {
      if(i < 100) return true;
      if(this.selectedNotes === -1) return false;
      if(Math.abs(i - this.selectedNotes) < 10) return true;
      return false;
    });
    await this.parent.render();
  }

  render(area: TUIArea) {

    const backgroundColor: [number, number, number] = [23, 124, 198];
    const foregroundColor: [number, number, number] = [201, 232, 255];
    const now = uiString([{ text: `${this.status.now} TIMELINE`, bold: true, backgroundColor, foregroundColor: [245, 245, 245] }], area.w, true);
    const left = uiString([{ text: ` <[h] ${this.status.left}`, backgroundColor, foregroundColor }], area.w, true);
    const right = uiString([{ text: `${this.status.right} [l]> `, backgroundColor, foregroundColor }], area.w, true);

    const texts = [];
    
    const width = area.w - area.x;
    const height = area.h - area.y;

    for (const note of this.notes) {
    
      texts.push(uiString([
        { text: `@${note.body.body.user.name}`, foregroundColor: [100, 100, 100] },
      ], width, true));

      texts.push(
        ...note.body.body.text.split(/\n/g).flatMap(text => 
          uiString([{ text },], width, false)
        )
      );

      texts.push([]);

      if(texts.length > height) break;
    }

    return Promise.resolve([
      {
        x: area.x,
        y: area.y + 2,
        z: 1,
        content: texts,
      },
      {
        x: area.x,
        y: area.y,
        z: 0,
        content: [uiString([{ text: ' '.repeat(area.w), backgroundColor }], area.w, true)]
      },
      {
        x: Math.floor(area.x + (area.w - now.length) / 2),
        y: area.y,
        z: 3,
        content: [now]
      },
      ...this.status.left === null ? [] : [{
        x: area.x,
        y: area.y,
        z: 2,
        content: [left]
      }],
      ...this.status.right === null ? [] : [{
        x: area.w - area.x - right.length,
        y: area.y,
        z: 2,
        content: [right],
      }]
    ]);
  }
}

