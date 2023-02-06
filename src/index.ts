import { StatusBar } from './components/statusbar.ts';
import { TUICanvas } from './tui/index.ts';
import { keyboard } from './tui/keyboard.ts';

const canvas = new TUICanvas();
canvas.components = [
  new StatusBar(canvas), 
];

keyboard.begin();
canvas.render();
