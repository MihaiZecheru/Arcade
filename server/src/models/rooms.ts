import { rps_choice } from "./games/rps";
import Player from "./player";
import { RoomID } from "./server";
import { UserID } from "./user";

/**
 * A base class for all rooms to inherit from
 */
class RoomBaseClass {
  public players: Array<Player> = [];
  public game_started: boolean = false;
  public room_id: RoomID;

  public constructor(room_id: RoomID) {
    this.room_id = room_id;
  }

  public get_player_count(): number {
    return this.players.length;
  }

  /**
   * Add a player to the room
   * @param player The player to add to the room
   */
  public add_player(player: Player) {
    this.players.push(player);
  }

  /**
   * Remove a player from the room
   * @param user_id The ID of the player to remove from the room
   */
  public remove_player(user_id: UserID) {
    let exists = false;
    this.players.forEach((player) => {
      if (player.user_id === user_id) {
        exists = true; return;
      }
    });

    if (!exists) {
      throw new Error(`User ${user_id} is not in room ${this.room_id}`);
    }

    this.players = this.players.filter(player => player.user_id !== user_id);
  }

  /**
   * Get a player from the room by their number (player 1, player 2, etc.)
   * @param player_number The number of the player to get
   * @returns 
   */
  public get_player_by_number(player_number: number): Player | null {
    return this.players[player_number - 1] || null;
  }

  /**
   * Get a player from the room by their user ID
   * @param user_id The user ID of the player to get
   * @returns 
   */
  public get_player_by_user_id(user_id: string): Player | null {
    return this.players.find(player => player.user_id === user_id) || null;
  }
}

/**
 * Rock Paper Scissors room
 */
export class RPSRoom extends RoomBaseClass {
  public player1_choice: rps_choice | null = null;
  public player2_choice: rps_choice | null = null;
}