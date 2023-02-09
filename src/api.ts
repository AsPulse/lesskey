import { z } from 'zod';

const userSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
  host: z.string().nullable(),
  emojis: z.record(z.string()).optional(),
  isBot: z.boolean(),
  isCat: z.boolean(),
});

const _errorSchema = z.object({
  error: z.object({
    code: z.string(),
  }),
});

const driveFileSchema = z.object({
  createdAt: z.string(),
  id: z.string(),
  name: z.string(),
  thumbnailUrl: z.string(),
  url: z.string(),
  type: z.string(),
  size: z.number(),
  blurhash: z.string(),
  comment: z.string().nullable(),
  properties: z.record(z.string(), z.unknown()),
});

const messageBaseSchema = z.object({
  text: z.string().nullable(),
  user: userSchema,
  createdAt: z.string(),
  renoteId: z.string().nullable(),
  renoteCount: z.number(),
  fileIds: z.array(z.string()),
  files: z.array(driveFileSchema),
  replayId: z.string().optional(),
  repliesCount: z.number(),
  reactions: z.record(z.string(), z.number()),
  reactionEmojis: z.record(z.string()),
  emojis: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  url: z.string().optional(),
  uri: z.string().optional(),
  visibility: z.union([
    z.literal('public'),
    z.literal('home'),
    z.literal('followers'),
    z.literal('specified'),
  ]),
  localOnly: z.boolean().optional(),
});

const messageSchema = messageBaseSchema.extend({
  renote: messageBaseSchema.optional(),
  reply: messageBaseSchema.optional(),
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

export type User = z.infer<typeof userSchema>;
export type ChannelMessageEvent = z.infer<typeof channelMessageSchema>;
export type NewNoteEvent = z.infer<typeof messageSchema>;

export class MisskeyAPI {
  ws: Promise<WebSocket>;
  listens: {
    type: 'channel';
    id: string;
    onMessage: (info: ChannelMessageEvent) => void;
  }[] = [];

  constructor(public origin: string, public token: string, onError: (e: Error) => void) {
    this.ws = new Promise((resolve) => {
      try {
        const ws = new WebSocket(`wss://${origin}/streaming?i=${token}`);
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
      `https://${this.origin}/api${endpoint}`,
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

  async postNote(content: string)  {
    return await this.request('/notes/create', {
      visibility: 'public',
      text: content,
      localOnly: false,
      poll: null,
    });
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
