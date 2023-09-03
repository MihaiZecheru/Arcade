import { RPSRoom } from '../src/models/rooms';
import { describe, test, expect, beforeEach } from '@jest/globals';
import uuid from '../src/models/ID';
import { UserID } from '../src/models/user';
import Server from '../src/server';

describe('Test the RPSRoom class', () => {
  // Create sample players and an RPSRoom instance for testing
  const player1_id: UserID = 'aa4d7f07-b82a-4b3b-bbf3-382d431b907b';
  const player2_id: UserID = 'c1eab2fe-797b-4a9f-ba48-ea155205044b';
  
  const room_id = uuid();
  let room: RPSRoom = new RPSRoom(room_id, 100);

  beforeEach(() => {
    room = new RPSRoom(room_id, 100);
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

  test('set_player_choice & get_player_choice methods', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});

    room.set_player_choice(player1_id, 'rock');
    room.set_player_choice(player2_id, 'scissors');

    expect(room.get_player_choice(player1_id)).toBe('rock');
    expect(room.get_player_choice(player2_id)).toBe('scissors');
  });

  test('room properties', () => {
    expect(room.room_id).toBe(room_id);
    expect(room.wager).toBe(100);
  });
});
