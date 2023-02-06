import { Message } from './components/message.ts';
import { StatusBar } from './components/statusbar.ts';
import { TUICanvas } from './tui/index.ts';
import { keyboard } from './tui/keyboard.ts';
import { sleep } from "./util/sleep.ts";

const canvas = new TUICanvas();

const connectStatus = new Message(canvas);

canvas.components = [
  new StatusBar(canvas),
  connectStatus,
];


keyboard.begin();
console.log('launching...');
connectStatus.setText('Connecting to misskey.io ...');

await sleep(500);

canvas.render();

