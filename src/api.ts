import { z } from 'zod';

const userSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
});

const _errorSchema = z.object({
  error: z.object({
    code: z.string(),
  }),
});

const messageSchema = z.object({
  text: z.string().nullable(),
  user: userSchema,
  createdAt: z.string(),
});

const fetchTimelineSchema = messageSchema.array();

const channelMessageSchema = z.object({
  type: z.literal('channel'),
  body: z.object({
    id: z.string(),
    type: z.literal('note'),
    body: messageSchema,
  }),
});

export type ChannelMessageEvent = z.infer<typeof channelMessageSchema>;
export type NewNoteEvent = z.infer<typeof messageSchema>;

export class MisskeyAPI {
  ws: Promise<WebSocket>;
  listens: {
    type: 'channel';
    id: string;
    onMessage: (info: ChannelMessageEvent) => void;
  }[] = [];

  constructor(public token: string, onError: (e: Error) => void) {
    this.ws = new Promise((resolve) => {
      try {
        const ws = new WebSocket(`wss://misskey.io/streaming?i=${token}`);
        ws.onopen = () => {
          resolve(ws);
          ws.onmessage = (m: MessageEvent) => {
            try {
              const json = JSON.parse(m.data);

              const channelMessage = channelMessageSchema.safeParse(json);
              if (channelMessage.success) {
                this.listens.find((v) => v.id === channelMessage.data.body.id)
                  ?.onMessage(channelMessage.data);
              }
            } catch {
              //TODO: WS Error Parse JSON
            }
          };
        };
        ws.onclose = () => {
          //TODO: handle correctly;
          Deno.exit(1);
        };
      } catch (e) {
        onError(e);
      }
    });
  }

  private async request(
    endpoint: `/${string}`,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const req = await fetch(
      `https://misskey.io/api${endpoint}`,
      {
        method: 'POST',
        body: JSON.stringify({ i: this.token, ...payload }),
        headers: {
          ['Content-Type']: 'application/json',
        },
      },
    );
    return req.json();
  }

  async getMe(): Promise<
    { success: true } & z.infer<typeof userSchema> | { success: false }
  > {
    const api = await this.request('/i', {});

    const ok = userSchema.safeParse(api);
    if (ok.success) {
      return { success: true, ...ok.data };
    }

    return { success: false };
  }

  async fetchTimeline(
    type: string,
    limit: number,
  ): Promise<z.infer<typeof fetchTimelineSchema>> {
    const api = await this.request(`/notes/${type}`, { limit });
    const data = fetchTimelineSchema.parse(api);
    return data;
  }

  async startListenChannel(
    channel: string,
    id: string,
    onMessage: (ev: ChannelMessageEvent) => void,
  ) {
    this.listens.push({ type: 'channel', id, onMessage });
    (await this.ws).send(JSON.stringify({
      type: 'connect',
      body: {
        channel,
        id,
      },
    }));
  }

  async stopListenChannel(id: string) {
    (await this.ws).send(JSON.stringify({
      type: 'disconnect',
      body: {
        id,
      },
    }));
  }
}
