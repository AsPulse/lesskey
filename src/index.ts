import { Message } from './components/message.ts';
import { StatusBar } from './components/statusbar.ts';
import { TUICanvas } from './tui/index.ts';
import { keyboard } from './tui/keyboard.ts';
import { parse } from 'std/flags/mod.ts';
import { sleep } from './util/sleep.ts';
import { MisskeyAPI } from './api.ts';
import { Timeline } from './components/timeline.ts';
import { NoteEditor } from './noteEditor.ts';

const canvas = new TUICanvas();

const statusBar = new StatusBar(canvas);
const connectStatus = new Message(canvas);
let timeline: null | Timeline = null;

canvas.components = [
  statusBar,
  connectStatus,
];

keyboard.begin();
await canvas.render();

const parsedArgs = parse(Deno.args);

let focusOn: 'timeline' | 'newpost' = 'timeline';

main: {
  if (!('token' in parsedArgs)) {
    await connectStatus.setText([
      'API Token was not provided!',
      'Usage: lesskey --token <YOUR_TOKEN_HERE>',
    ]);
    break main;
  }

  if(!('origin' in parsedArgs)) {
    await connectStatus.setText([
      'Origin was not specified.',
      'Connecting to Misskey.io.'
    ])
    parsedArgs.origin = 'misskey.io'
  }

  await connectStatus.setText([`Connecting to ${parsedArgs.origin}`, 'Please wait...']);
  await sleep(300);
  const api = new MisskeyAPI(parsedArgs.origin, parsedArgs.token, () => {
    connectStatus.setText(['Error: The token or origin is wrong.']);
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
  openTimeline(api);
}

async function openTimeline(api: MisskeyAPI) {
  keyboard.begin();
  focusOn = 'timeline';
  await statusBar.setText('N…New Note')
  timeline ??= new Timeline(canvas, api, statusBar);

  canvas.components = [
    statusBar,
    timeline,
  ];

  canvas.pauseRender = false;
  await canvas.render();

  keyboard.onPress(buf => {
    // N
    if(buf[0] === 78 && buf[1] === 0) {
      postNewNote(api);
      keyboard.pauseFlag = true;
    }
  });
}

async function postNewNote(api: MisskeyAPI) {
  if(focusOn === 'newpost') return;
  focusOn = 'newpost';

  await statusBar.setText('Opening TextEditor...');
  canvas.pauseRender = true;
  await sleep(300);

  const note = await NoteEditor('editor' in parsedArgs ? parsedArgs.editor : 'vim');


  if(!note.cancelled) {
    await api.postNote(note.content);
  }

  openTimeline(api);
}
