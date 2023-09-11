import router from '../src/routes/router';
import { RPSRoom } from '../src/models/rooms';
import Server from '../src/server';
import { describe, test, expect } from '@jest/globals';

describe('Test the get_all_rooms function', () => {
  const req = { body: { wager: 10 } };
  const res = { text: '', send: (x: any) => { res.text = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };
  
  const room1: RPSRoom = Server.rps_get_room(Server.rps_create_room(10));
  const room2: RPSRoom = Server.rps_get_room(Server.rps_create_room(20));

  test('get_all_rooms', async () => {
    router.rps.get_all_rooms(req, res);
    const rooms: Array<RPSRoom> = JSON.parse(res.text);
    expect(res.statusCode).toBe(200);
    expect(rooms.length).toBe(2);
    expect(rooms).toContain(room1);
    expect(rooms).toContain(room2);
  });

  // cleanup
  Server.rps_delete_room(room1.id);
  Server.rps_delete_room(room2.id);
});
