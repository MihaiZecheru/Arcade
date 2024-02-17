import router from '../src/routes/router';
import { RPSRoom } from '../src/models/rooms';
import Server from '../src/server';
import { describe, test, expect } from '@jest/globals';

describe('Test the get_all_rooms function', () => {
  test('get_all_rooms', () => {
    const room1: RPSRoom = Server.RPS_get_room(Server.RPS_create_room(10));
    const room2: RPSRoom = Server.RPS_get_room(Server.RPS_create_room(25));

    const req = {};
    const res = { text: null, send: (x: any) => { res.text = x }, statusCode: null, status: (x: any) => { res.statusCode = x; return res; } };

    router.RPS.get_all_rooms(req, res);
    const rooms: Array<RPSRoom> = res.text!;

    expect(res.statusCode).toBe(200);
    expect(rooms.length).toBe(2);
    expect(rooms).toContain(room1);
    expect(rooms).toContain(room2);
    
    // cleanup
    Server.RPS_delete_room(room1.id);
    Server.RPS_delete_room(room2.id);
  });
});
