import { describe, test, expect, beforeEach } from '@jest/globals';
import { RPSRoom } from '../src/models/rooms';
import { UserID } from '../src/models/user';
import uuid from '../src/models/ID';

describe('Test the RPSRoom', () => {
  const player1_id: UserID = 'aa4d7f07-b82a-4b3b-bbf3-382d431b907b';
  const player2_id: UserID = 'c1eab2fe-797b-4a9f-ba48-ea155205044b';

  const room_id = uuid();
  let room: RPSRoom = new RPSRoom(room_id, 100);

  test('set_player_choice & get_player_choice methods', () => {
    room.add_player(player1_id, {});
    room.add_player(player2_id, {});

    room.set_player_choice(player1_id, 'rock');
    room.set_player_choice(player2_id, 'scissors');

    expect(room.get_player_choice(player1_id)).toBe('rock');
    expect(room.get_player_choice(player2_id)).toBe('scissors');
  });

  test('room_full method', () => {
    expect(room.room_full()).toBe(true);
  });

  test('room_full method - should be false', () => {
    room = new RPSRoom(room_id, 100); // clear the player choices
    expect(room.room_full()).toBe(false);
  });
});