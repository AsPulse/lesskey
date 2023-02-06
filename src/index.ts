import { StatusBar } from './components/statusbar.ts';
import { TUICanvas } from './tui/index.ts';
import { sleep } from "./util/sleep.ts";

const canvas = new TUICanvas();
canvas.components = [
  new StatusBar(canvas), 
];


await canvas.render();
await sleep(3000);
