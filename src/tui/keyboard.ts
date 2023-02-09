import { EventEmitter } from 'std/node/events.ts';

export class TUIKeyboardListener {
  constructor() {}

  buf = new Uint8Array(16);
  private events = new EventEmitter();
  listening = false;
  pauseFlag = false;

  async begin() {
    if(this.listening) return;
    this.listening = true;
    Deno.stdin.setRaw(true);

    while (true) {
      this.buf.fill(0);
      const nread = await Deno.stdin.read(this.buf);

      if (nread === null) break;

      //Ctrl-C to break
      if (this.buf && this.buf[0] === 0x03) {
        this.exit();
        break;
      }

      if (this.buf) this.events.emit('press', this.buf);
      if (this.pauseFlag) {
        this.pauseFlag = false;
        break;
      }
    }

    Deno.stdin.setRaw(false);
    this.listening = false;
  }

  exit(){
    Deno.stdin.setRaw(false);
    Deno.exit(0);
  }

  onPress(emitter: (buf: Uint8Array) => void) {
    this.events.on('press', emitter);
  }
}

export const keyboard = new TUIKeyboardListener();
