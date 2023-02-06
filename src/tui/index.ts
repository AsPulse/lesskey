import { getSize } from 'https://deno.land/x/terminal_size@0.1.0/mod.ts';
import { writeAll } from 'https://deno.land/std@0.172.0/streams/write_all.ts';
export interface TUIPoint {
  x: number;
  y: number;
  w: number;
}

export type TUIArea = TUIPoint & {
  h: number;
  z: number;
}

export type TUIResult = {
  x: number;
  y: number;
  z: number;
  content: string[][];
}

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

  size: null | { cols: number, rows: number } = null;

  constructor() {
    setInterval(() => {
      if(this.size === null) return;
      const newSize = getSize();
      if(newSize.cols === this.size.cols && newSize.rows == this.size.rows) return;
      this.render();
    }, 100);
  }

  async render() {
    if(this.rendering) {
      this.needToReRender = true;
      return;
    }

    this.rendering = true;
    let text = '';

    this.size = getSize();
    const { cols: width, rows: height } = this.size;

    const area: TUIArea = {
      x: 0, y: 0, w: width, h: height, z: -1,
    };

    const results = (await Promise.all(this.components.map(v => v.render(area)))).flat();
    
  
    for(let y = 0; y < area.h; y++) {
      for(let x = 0; x < area.w; x++) {
        const onComponents = results
            .filter(({ x: cx, y: cy, content }) => cy <= y && y < cy + content.length && cx <= x && x < cx + content[y - cy].length);

        if(onComponents.length < 1) {
          text += ' ';
        } else {
          const topComponent = onComponents.reduce((a, b) => a.z > b.z ? a : b);
          text += topComponent.content[y - topComponent.y][x - topComponent.x];
        }

      }
      if(y + 1 < area.h) text += '\n';
    }
 
    const encoded = this.encoder.encode('\x1b[1;1H' + text + '\x1b[0K');

    await writeAll(Deno.stdout, encoded);

    this.rendering = false;
    if(this.needToReRender) {
      this.needToReRender = false;
      await this.render();
    }
  }
}
