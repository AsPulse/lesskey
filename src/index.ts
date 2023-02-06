import { Message } from './components/message.ts';
import { StatusBar } from './components/statusbar.ts';
import { TUICanvas } from './tui/index.ts';
import { keyboard } from './tui/keyboard.ts';
import { parse } from 'https://deno.land/std@0.66.0/flags/mod.ts';

const canvas = new TUICanvas();

const statusBar = new StatusBar(canvas);
const connectStatus = new Message(canvas);

canvas.components = [
  statusBar,
  connectStatus,
];

keyboard.begin();
await canvas.render();

const parsedArgs = parse(Deno.args);

if('token' in parsedArgs) {
  connectStatus.setText(['Connecting to misskey.io!', 'Please wait...']);
} else {
  connectStatus.setText(['API Token was not provided!', 'Usage: lesskey --token <YOUR_TOKEN_HERE>']); 
}

