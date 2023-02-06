import { EventEmitter } from 'https://deno.land/std@0.161.0/node/events.ts';

export class TUIKeyboardListener {
  constructor() { }

  buf = new Uint8Array(16);
  private events = new EventEmitter();

  async begin() {
    Deno.stdin.setRaw(true);

    while(true) {
      this.buf.fill(0);
      const nread = await Deno.stdin.read(this.buf);

      if(nread === null) break;
  
      //Ctrl-C to break
      if(this.buf && this.buf[0] === 0x03) break;

      if(this.buf) this.events.emit('press', this.buf);
    }

    Deno.stdin.setRaw(false);

    Deno.exit(0);
  }

  onPress(emitter: (buf: Uint8Array) => void) {
    this.events.on('press', emitter);
  } 
}


export const keyboard = new TUIKeyboardListener(); 
