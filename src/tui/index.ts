import { writeAll } from "https://deno.land/std@0.172.0/streams/write_all.ts";
import { is2Byte } from "./string.ts";
export interface TUIPoint {
  x: number;
  y: number;
  w: number;
}

export type TUIArea = TUIPoint & {
  h: number;
  z: number;
};

export type TUIResult = {
  x: number;
  y: number;
  z: number;
  content: string[][];
};

export type TUIRenderer = (parentArea: TUIArea) => Promise<TUIResult[]>;
export type TUIParent = { render: () => Promise<void> };

export abstract class TUIComponent {
  abstract parent: TUIParent;
  abstract render: TUIRenderer;
}

export class TUICanvas {
  components: TUIComponent[] = [];
  encoder = new TextEncoder();

  rendering = false;
  needToReRender = false;

  size: null | { columns: number; rows: number } = null;

  constructor() {
    setInterval(() => {
      if (this.size === null) return;
      const newSize = Deno.consoleSize();
      if (
        newSize.columns === this.size.columns && newSize.rows == this.size.rows
      ) return;
      this.render();
    }, 100);
  }

  async render() {
    if (this.rendering) {
      this.needToReRender = true;
      return;
    }

    this.rendering = true;
    let text = "";

    this.size = Deno.consoleSize();
    const { columns: width, rows: height } = this.size;

    const area: TUIArea = {
      x: 0,
      y: 0,
      w: width,
      h: height,
      z: -1,
    };

    const results =
      (await Promise.all(this.components.map((v) => v.render(area)))).flat();

    for (let y = 0; y < area.h; y++) {
      for (let x = 0; x < area.w; x++) {
        const onComponents = results
          .filter(({ x: cx, y: cy, content }) => {
            if (
              cy <= y && y < cy + content.length && cx <= x &&
              content[y - cy] === undefined
            ) {
              throw { content, y, x, cx, cy };
            }
            return cy <= y && y < cy + content.length && cx <= x &&
              x < cx + content[y - cy].length;
          });

        if (onComponents.length < 1) {
          text += " ";
        } else {
          const topComponent = onComponents.reduce((a, b) => a.z > b.z ? a : b);
          const content =
            topComponent.content[y - topComponent.y][x - topComponent.x];
          if (x === area.w - 1 && is2Byte(content)) {
            text += " ";
            continue;
          }
          text += content;
        }
      }
      if (y + 1 < area.h) text += "\n"; //`\n\x1b[${y + 2};1H`;
    }

    const encoded = this.encoder.encode(
      "\x1b[1;1H" + text + `\x1b[${area.h}:${area.w}H\x1b[0K`,
    );

    await writeAll(Deno.stdout, encoded);

    this.rendering = false;
    if (this.needToReRender) {
      this.needToReRender = false;
      await this.render();
    }
  }
}
