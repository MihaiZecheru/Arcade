import { UserID } from "./user";
import uuid, { ID } from "./ID";
import { rps_choice } from "./games/rps";

/**
 * The ID of a room on the server
 */
export type RoomID = ID;

/**
 * All games in the server
 */
type TGame = "rps" | "hilo";

/**
 * The server's data
 */
type TServer = {
  "rps": {
    [room_id: RoomID]: {
      "player1": UserID | null,
      "player2": UserID | null,
      "player1_choice": rps_choice | null,
      "player2_choice": rps_choice | null,
      "game_started": boolean
    }
  }
};

export default class Server {
  /**
   * The ID of every room on the server
   */
  private static room_ids: Array<RoomID> = [];

  /**
   * The server's data
   */
  private static server: TServer = {
    "rps": {}
  };

  /*** Rock Paper Scissors ***/

  /**
   * Create a room for rock-paper-scissors
   * @returns The ID of the room
   */
  public static rps_create_room(): RoomID {
    const id: RoomID = uuid() as RoomID;
    
    this.room_ids.push(id);
    this.server.rps[id] = {
      "player1": null,
      "player2": null,
      "player1_choice": null,
      "player2_choice": null,
      "game_started": false
    };

    return id;
  }

  /**
   * Add a player to a rock-paper-scissors room
   * @param room_id The ID of the room the player is joining
   * @param player_id The ID of the player joining the room
   * @returns Whether the room is full and the game can start
   */
  public static rps_add_player(room_id: RoomID, player_id: UserID): boolean {
    if (this.server.rps[room_id].player1 === null) {
      this.server.rps[room_id].player1 = player_id;
      return false;
    } else {
      this.server.rps[room_id].player2 = player_id;
      return true;
    }
  }

  /**
   * Remove a player from a rock-paper-scissors room
   * @param room_id The ID of the room to remove the player from
   * @param player_id The ID of the player to remove from the room
   */
  public static rps_remove_player(room_id: RoomID, player_id: UserID) {
    if (this.server.rps[room_id].player1 === player_id) {
      this.server.rps[room_id].player1 = null;
    } else {
      this.server.rps[room_id].player2 = null;
    }
  }

  public static rps_start_game(room_id: RoomID) {
    this.server.rps[room_id].game_started = true;
  }

  /**
   * Add the choice a player made in a rock-paper-scissors game
   * @param room_id The ID of the room the player is in
   * @param player_id The ID of the player choosing
   * @param choice The choice the player is making - rock, paper, or scissors
   * @returns True if both players have chosen, false otherwise
   */
  public static rps_player_choose(room_id: RoomID, player_id: UserID, choice: rps_choice): boolean {
    if (player_id === this.server.rps[room_id].player1) {
      // player1
      this.server.rps[room_id].player1_choice = choice;
      return false;
    } else {
      // player2
      this.server.rps[room_id].player2_choice = choice;
      return true;
    }
  }

  /**
   * Decide the winner of a rock-paper-scissors game
   * @note This function assumes that both players have chosen
   * @param room_id The ID of the room to get the winner of
   * @returns The ID of the winner, or null if there is no winner
   */
  public static rps_decide_winner(room_id: RoomID): UserID | null {
    const player1_choice: rps_choice = this.server.rps[room_id].player1_choice!;
    const player2_choice: rps_choice = this.server.rps[room_id].player2_choice!;

    const player1: UserID = this.server.rps[room_id].player1!;
    const player2: UserID = this.server.rps[room_id].player2!;

    // tie
    if (player1_choice === player2_choice) return null;
    
    if (player1_choice === "rock") {
      if (player2_choice === "paper") return player2;
      else return this.server.rps[room_id].player1;
    } else if (player1_choice === "paper") {
      if (player2_choice === "scissors") return player2;
      else return player1;
    } else {
      if (player2_choice === "rock") return player2;
      else return player1;
    }
  }
}