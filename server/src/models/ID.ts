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

export const uuid_regex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/g);

export function is_uuid(uuid: string): boolean {
  return uuid_regex.test(uuid);
}
