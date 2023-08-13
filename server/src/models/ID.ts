export type ID = `${string}-${string}-4${string}-${string}-${string}`;

export default function uuid(): ID {
  const _uuid: ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) as ID;

  // do not allow uuid to begin with a number
  if (/[0-9]/g.test(_uuid[0])) return uuid();
  else return _uuid;
}