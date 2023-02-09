export const newNoteDefault = `
; ↑↑↑
; この上にあなたの投稿したい内容を書いてください。
; Please write your Note above this.
;
; セミコロンで始まる行はコメントになります。
; Lines starting with a semicolon are comments.
;
`;

export async function NoteEditor(content = newNoteDefault) {
  const file = await Deno.makeTempFile({
    prefix: 'Lesskey_NoteEditor_',
    suffix: ''
  });

  await Deno.writeTextFile(file, content);

  Deno.stdin.setRaw(false);
  await new Deno.Command('nvim', { args: [file] }).spawn().status;
  Deno.stdin.setRaw(true);
}
