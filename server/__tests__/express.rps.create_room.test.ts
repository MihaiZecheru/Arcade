import router from '../src/routes/router';
import Database, { TEntry } from '../mdb_local/index';
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { IUser, UserID } from '../src/models/user';
import { uuid_regex } from '../src/models/ID';
import Server, { RoomID } from '../src/server';
import { RPSRoom } from '../src/models/rooms';

beforeEach(() => {
  Database.connect();
  Database.set_table_parse_function("Users", (entry: TEntry): IUser => {
    let user: IUser = {} as IUser;
    user.user_id = entry.user_id as UserID;
    user.username = entry.username;
    user.password = entry.password;
    user.balance = parseInt(entry.balance);
    user.email = entry.email;
    user.birthday = entry.birthday;
    user.joined = entry.joined;
    return user;
  });
});

afterEach(() => {
  Database.disconnect();
});

describe('Test the rps.create_room function -- create a new room in the database', () => {
  const req = { body: { wager: 10 } };
  const res = { text: '', send: (x: any) => { res.text = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };

  test('create a room with a wager of 10 successfully', async () => {
    await router.rps.create_room(req, res);
    expect(res.statusCode).toBe(200);
    const room_id = res.text;
    expect(room_id).toMatch(uuid_regex);
    const room = Server.rps_get_room(room_id as RoomID);
    expect(room_id).toBe(room.room_id);
    expect(room).toEqual(new RPSRoom(room_id as RoomID, 10));

    // cleanup
    Server.rps_delete_room(room_id as RoomID);
  });

  test('create a room with a wager of -5 - should throw error', async () => {
    await router.rps.create_room({ body: { wager: -5 }}, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Wager must be greater than 0');
  });

  test('create a room with a wager of 0 - should throw error', async () => {
    await router.rps.create_room({ body: { wager: 0 }}, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Wager must be greater than 0');
  });

  test('create a room with a float wager of 2.5 - should throw error', async () => {
    await router.rps.create_room({ body: { wager: 2.5 }}, res);
    expect(res.statusCode).toBe(400);
    expect(res.text).toBe('Wager must be a whole number');
  });
});
