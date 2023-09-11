import { RoomBaseClass } from '../src/models/rooms';
import { describe, test, expect, beforeEach } from '@jest/globals';
import uuid from '../src/models/ID';
import { UserID } from '../src/models/user';

describe('Test the RoomBaseClass', () => {
  const player1_id: UserID = 'aa4d7f07-b82a-4b3b-bbf3-382d431b907b';
  const player2_id: UserID = 'c1eab2fe-797b-4a9f-ba48-ea155205044b';
  
  const room_id = uuid();
  let room: RoomBaseClass = new RoomBaseClass(room_id, 100);

  beforeEach(() => {
    room = new RoomBaseClass(room_id, 100);
  });

  test('add_player method', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});

    const ids = room.players.map(player => player.user_id);
    expect(ids).toContain(player1_id);
    expect(ids).toContain(player2_id);
  });

  test('remove_player method', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});
    
    room.remove_player(player1_id);
    const ids = room.players.map(player => player.user_id);
    expect(ids).not.toContain(player1_id);
    expect(ids).toContain(player2_id);
  });

  test('get_player_by_number method', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});

    const player = room.get_player_by_number(2);
    expect(player.user_id).toBe(player2_id);
  });

  test('get_player_by_user_id method', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});
    
    const player = room.get_player_by_user_id(player2_id);
    expect(player?.user_id).toBe(player2_id);
  });

  test('player_count method', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});
    expect(room.player_count()).toBe(2);
  });

  test('room properties', () => {
    expect(room.id).toBe(room_id);
    expect(room.wager).toBe(100);
  });

  test('add player already in room', () => {
    room.add_player(player1_id, {});
    expect(() => room.add_player(player1_id, {}))
      .toThrow(`User '${player1_id}' is already in room '${room.id}'`);
  });

  test('add player to full room', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});
    expect(() => room.add_player("d111b9b8-7a8c-4f54-8239-62515df69caf", {})).toThrow(`Room '${room.id}' is full`);
    expect(room.player_count()).toBe(2);
  });

  test('remove player from an empty room', () => {
    const emptyRoom = new RoomBaseClass(uuid(), 2);
    expect(() => emptyRoom.remove_player('d111b9b8-7a8c-4f54-8239-62515df69caf')).toThrow(`User 'd111b9b8-7a8c-4f54-8239-62515df69caf' is not in room '${room.id}'`);
    expect(emptyRoom.player_count()).toBe(0);
  });

  test('get_player_by_number method with invalid player number', () => {
    room.add_player(player1_id, {});
    expect(() => room.get_player_by_number(0)).toThrow(`There is currently no player number '0' in room '${room.id}`);
    expect(() => room.get_player_by_number(2)).toThrow(`There is currently no player number '2' in room '${room.id}`);
    const player = room.get_player_by_number(1);
    expect(player.user_id).toBe(player1_id);
  });

  test('get_player_by_user_id method with non-existing user ID', () => {
    room.add_player(player1_id, {});
    expect(() => room.get_player_by_user_id('d111b9b8-7a8c-4f54-8239-62515df69caf')).toThrow(`Player 'd111b9b8-7a8c-4f54-8239-62515df69caf' is not in room '${room.id}'`);
  });
});
