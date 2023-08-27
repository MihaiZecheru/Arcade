import User, { IUser, UserID } from "./user";
import uuid, { ID } from "./ID";
import { rps_choice } from "./games/rps";
import IPlayer from "./player";
import { RPSRoom } from "./rooms";
import Database from "../../mdb_local";

/**
 * The ID of a room on the server
 */
export type RoomID = ID;

/**
 * All games in the server
 */
type TGame = "rps" | "hilo";

/**
 * The Server class's data
 */
type TServer = {
  "rps": {
    [room_id: RoomID]: RPSRoom
  },
  "hilo": {} // TODO
};

/**
 * The Server class - handles connections to the server and game events / logic
 */
export default class Server {
  /**
   * The ID of every room on the server
   */
  private static room_ids: Array<RoomID> = [];

  /**
   * The server's data
   */
  private static server: TServer = {
    "rps": {},
    "hilo": {}
  };

  /**
   * Check if a room exists for a given game
   * @param game The game to check for
   * @param room_id The ID of the room to check
   * @returns Whether or not the room exists
   */
  public static room_exists(game: TGame, room_id: RoomID): boolean {
    // @ts-ignore
    return this.server[game][room_id] !== undefined;
  }



  /*** User Balance ***/



  public static async get_user(user_id: UserID): Promise<User> {
    return await User.get_user(user_id);
  }
  
  /**
   * Get a user's balance
   * @param user_id The ID of the user to get the balance of
   * @returns The user's balance
   */
  public static async get_user_balance(user_id: UserID): Promise<number> {
    return (Database.get_where("Users", "user_id", user_id, true) as IUser).balance;
  }

  /**
   * Increase a user's balance by the given amount
   * @param user_id The ID of the user to increase the balance of
   * @param amount The amount to increase the balance by
   * @returns The user's new balance
   */
  public static async increase_user_balance(user_id: UserID, amount: number): Promise<number> {
    const balance = await this.get_user_balance(user_id);
    
    Database.patch_where("Users", "user_id", user_id, {
      balance: (balance + amount).toString()
    });

    return balance + amount;
  }

  /**
   * Decrease a user's balance by the given amount
   * @param user_id The ID of the user to decrease the balance of
   * @param amount The amount to decrease the balance by
   * @returns The user's new balance
   */
  public static async decrease_user_balance(user_id: UserID, amount: number): Promise<number> {
    const balance = await this.get_user_balance(user_id);
    
    Database.patch_where("Users", "user_id", user_id, {
      balance: (balance - amount).toString()
    });

    return balance - amount;
  }



  /*** Rock Paper Scissors ***/



  /**
   * Create a room for rock-paper-scissors
   * @returns The ID of the room
   */
  public static rps_create_room(wager: number): RoomID {
    if (wager <= 0) throw new Error("Wager must be greater than 0");
    if (Math.floor(wager) !== wager) throw new Error("Wager must be a whole number");
    
    const id: RoomID = uuid() as RoomID;
    
    this.room_ids.push(id);
    this.server.rps[id] = new RPSRoom(id, wager);

    return id;
  }

  /**
   * Get a rock-paper-scissors room by ID
   * @param room_id The ID of the room to get
   * @returns The room with the given ID
   */
  public static rps_get_room(room_id: RoomID): RPSRoom {
    return this.server.rps[room_id];
  }

  /**
   * Add a player to a rock-paper-scissors room
   * @param room_id The ID of the room the player is joining
   * @param user_id The ID of the player joining the room
   * @returns Whether the room is full and the game can start
   * @throws {Error} If the room is full
   */
  public static rps_join_room(room_id: RoomID, user_id: UserID, ws: any): boolean {
    if (this.server.rps[room_id].get_player_count() >= 2) {
      throw new Error(`Room ${room_id} is full`);
    }
    
    this.server.rps[room_id].add_player({
      "user_id": user_id,
      "player_number": this.server.rps[room_id].players.length + 1,
      "ws": ws
    });
    
    return this.server.rps[room_id].get_player_count() === 2;
  }

  /**
   * Remove a player from a rock-paper-scissors room
   * @param room_id The ID of the room to remove the player from
   * @param user_id The ID of the player to remove from the room
   * @throws {Error} If the given user is not in the room
   */
  public static rps_leave_room(room_id: RoomID, user_id: UserID) {
    this.server.rps[room_id].remove_player(user_id);
  }

  /**
   * Start a rock-paper-scissors game and deduct the wager from both players
   * @param room_id The ID of the room that's starting
   */
  public static rps_start_game(room_id: RoomID) {
    this.server.rps[room_id].game_started = true;
    
    const room = this.rps_get_room(room_id);
    room.players.forEach((player: IPlayer) => {
      // deduct wager from player's balance
      this.decrease_user_balance(player.user_id, room.wager);
      
      // send game_start notice to player client
      player.ws.send("game_start");
    });
  };

  /**
   * Add the choice a player made in a rock-paper-scissors game
   * @note Assumes the game is in progress and both players are connected
   * @param room_id The ID of the room the player is in
   * @param player_id The ID of the player choosing
   * @param choice The choice the player is making - rock, paper, or scissors
   * @returns True if both players have chosen, false otherwise
   */
  public static rps_player_choose(room_id: RoomID, player_id: UserID, choice: rps_choice): boolean {
    ;
    if (player_id === this.server.rps[room_id].get_player_by_number(1)?.user_id) {
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
  public static rps_decide_winner(room_id: RoomID): IPlayer | null {
    const player1_choice: rps_choice = this.server.rps[room_id].player1_choice!;
    const player2_choice: rps_choice = this.server.rps[room_id].player2_choice!;

    const player1: IPlayer = this.server.rps[room_id].get_player_by_number(1)!;
    const player2: IPlayer = this.server.rps[room_id].get_player_by_number(2)!;

    // tie
    if (player1_choice === player2_choice) return null;
    
    if (player1_choice === "rock") {
      if (player2_choice === "paper") return player2;
      else return this.server.rps[room_id].get_player_by_number(1)!;
// sourcery skip: merge-else-if
    } else if (player1_choice === "paper") {
      if (player2_choice === "scissors") return player2;
      else return player1;
    } else {
      if (player2_choice === "rock") return player2;
      else return player1;
    }
  }
}