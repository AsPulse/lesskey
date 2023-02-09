import { Message } from './components/message.ts';
import { StatusBar } from './components/statusbar.ts';
import { TUICanvas } from './tui/index.ts';
import { keyboard } from './tui/keyboard.ts';
import { parse } from 'std/flags/mod.ts';
import { sleep } from './util/sleep.ts';
import { MisskeyAPI } from './api.ts';
import { Timeline } from './components/timeline.ts';

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

main: {
  if (!('token' in parsedArgs)) {
    await connectStatus.setText([
      'API Token was not provided!',
      'Usage: lesskey --token <YOUR_TOKEN_HERE>',
    ]);
    break main;
  }

  await connectStatus.setText(['Connecting to misskey.io!', 'Please wait...']);
  await sleep(300);
  const api = new MisskeyAPI(parsedArgs.token, () => {
    connectStatus.setText(['Error: The token is wrong.']);
  });

  await api.ws;

  const me = await api.getMe();

  if (!me.success) {
    await connectStatus.setText([
      'An unknown error occurred during the connection.',
    ]);
    break main;
  }

  await connectStatus.setText([`Logged in as "${me.name}"!`]);
  await sleep(1250);

  await statusBar.setId(me.username);

  const timeline = new Timeline(canvas, api);

  canvas.components = [
    statusBar,
    timeline,
  ];

  await canvas.render();
}
