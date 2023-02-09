export const newNoteDefault = `
; ↑↑↑
; この上にあなたの投稿したい内容を書いてください。
; Please write your Note above this.
;
; セミコロンで始まる行はコメントになります。
; Lines starting with a semicolon are comments.
;
`;

export async function NoteEditor(editor: string, content = newNoteDefault): Promise<{ cancelled: false, content: string } | { cancelled: true }> {
  const file = await Deno.makeTempFile({
    prefix: 'Lesskey_NoteEditor_',
    suffix: ''
  });

  await Deno.writeTextFile(file, content);

  Deno.stdin.setRaw(false);
  await new Deno.Command(editor, { args: [file] }).spawn().status;
  Deno.stdin.setRaw(true);

  const text = await Deno.readTextFile(file);
  await Deno.remove(file);

  if(content === text) return { cancelled: true };

  return { cancelled: false, content: text.split(/\n/).filter(v => !v.startsWith(';')).join('\n').trim() };
}
