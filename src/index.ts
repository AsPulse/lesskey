import { Message } from './components/message.ts';
import { StatusBar } from './components/statusbar.ts';
import { TUICanvas } from './tui/index.ts';
import { keyboard } from './tui/keyboard.ts';
import { parse } from 'https://deno.land/std@0.66.0/flags/mod.ts';
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
  if(!('token' in parsedArgs)) {
    await connectStatus.setText(['API Token was not provided!', 'Usage: lesskey --token <YOUR_TOKEN_HERE>']); 
    break main;
  }

  await connectStatus.setText(['Connecting to misskey.io!', 'Please wait...']);
  await sleep(300);
  const api = new MisskeyAPI(parsedArgs.token, () => {
    connectStatus.setText(['Error: The token is wrong.']);
  });

  await api.ws;

  const me = await api.getMe();

  if(!me.success) {
    await connectStatus.setText(['An unknown error occurred during the connection.']);
    break main;
  }

  await connectStatus.setText([`Logged in as "${me.name}"!`]);
  await sleep(1250);

  await statusBar.setId(me.username);

  // TIMELINE
  const timelines = [
    { view: 'Home', id: 'homeTimeline' },
    { view: 'Local', id: 'localTimeline' },
    { view: 'Social', id: 'socialTimeline' },
    { view: 'Global', id: 'globalTimeline' },
  ] as const;

  let activeTimeline = 1;

  const timeline = new Timeline(canvas);
  canvas.components = [
    statusBar,
    timeline
  ];

  const setTimeline = (index: number) => {
    const left = index === 0 ? null : timelines[index - 1].view;
    const right = index === timelines.length - 1 ? null : timelines[index + 1].view;
    timeline.resetTimeline({
      left, right, now: timelines[index].view,
    });
    api.startListenChannel(timelines[index].id, `--lesskey-TL-${Date.now()}`, e => {
      timeline.addNote(e);
    });
  };

  setTimeline(activeTimeline);
  keyboard.onPress(buf => {
    // Key H
    if(buf[0] === 104 && buf[1] === 0) {
      if(activeTimeline > 0) setTimeline(--activeTimeline);
      return;
    }

    if(buf[0] === 108 && buf[1] === 0) {
      if(activeTimeline < timelines.length - 1) setTimeline(++activeTimeline);
      return;
    }
  });

}

