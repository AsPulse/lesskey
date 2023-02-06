import { z } from 'https://deno.land/x/zod@v3.16.1/mod.ts';

const misskeySchemaMe = z.object({
  username: z.string(),
  name: z.string(),
});

const errorSchema = z.object({
  error: z.object({
    code: z.string()
  })
});

export class MisskeyAPI {
  constructor(public token: string) {}

  private async request(endpoint: `/${string}`, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const req = await fetch(
      `https://misskey.io/api${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ i: this.token, ...payload }),
        headers: {
          ['Content-Type']: 'application/json',
        }
      }
    );
    return req.json();
  }

  async getMe(): Promise<{ success: true } & z.infer<typeof misskeySchemaMe> | { success: false, reason: 'UNKNOWN' | 'AUTHENTICATION_FAILED' }> {
    const api = await this.request('/i', {});

    const ok = misskeySchemaMe.safeParse(api);
    if(ok.success) {
      return { success: true, ...ok.data };
    }

    const err = errorSchema.safeParse(api);
    if(err.success && err.data.error.code === 'AUTHENTICATION_FAILED') {
      return { success: false, reason: err.data.error.code };
    }

    return { success: false, reason: 'UNKNOWN' };
  
  }

}
