import User, { IUser, UserID } from "./models/user";
import uuid, { ID } from "./models/ID";
import { rps_choice } from "./models/games/rps";
import IPlayer from "./models/player";
import { RPSRoom } from "./models/rooms";
import Database from "../mdb_local";

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
  // "hilo": {} // TODO
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
    // "hilo": {}
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



  /*** Users ***/



  public static get_user(user_id: UserID): User {
    return User.get_user(user_id);
  }
  
  /**
   * Get a user's balance (wallet + bank)
   * @param user_id The ID of the user to get the total balance of
   * @returns The user's total balance (wallet + bank)
   */
  public static get_user_total_balance(user_id: UserID): number {
    const user: IUser = Database.get_unique_where<IUser>("Users", "user_id", user_id)!;
    return user.bank_balance + user.wallet_balance;
  }

  /**
   * Get a user's wallet balance
   * @param user_id The ID of the user to get the wallet balance of
   * @returns The user's wallet balance
   */
  public static get_user_wallet_balance(user_id: UserID): number {
    return Database.get_unique_where<IUser>("Users", "user_id", user_id)!.wallet_balance;
  }

  /**
   * Get a user's bank balance
   * @param user_id The ID of the user to get the bank balance of
   * @returns The user's bank balance
   */
  public static get_user_bank_balance(user_id: UserID): number {
    return Database.get_unique_where<IUser>("Users", "user_id", user_id)!.bank_balance;
  }

  /**
   * Increase a user's wallet balance by the given amount
   * @param user_id The ID of the user to increase the wallet balance of
   * @param amount The amount to increase the wallet balance by (must be positive)
   * @returns The user's new wallet balance
   * @throws {Error} If the amount is negative
   */
  public static increase_user_wallet_balance(user_id: UserID, amount: number): number {
    const wallet_balance = this.get_user_wallet_balance(user_id);
    if (amount < 0) throw new Error("Amount must be positive");
    
    Database.patch_where("Users", "user_id", user_id, {
      wallet_balance: (wallet_balance + amount).toString()
    });

    return wallet_balance + amount;
  }

  /**
   * Increase a user's bank balance by the given amount
   * @param user_id The ID of the user to increase the bank balance of
   * @param amount The amount to increase the bank balance by (must be positive)
   * @returns The user's new bank balance
   * @throws {Error} If the amount is negative
   */
  public static increase_user_bank_balance(user_id: UserID, amount: number): number {
    const bank_balance = this.get_user_bank_balance(user_id);
    if (amount < 0) throw new Error("Amount must be positive");
    
    Database.patch_where("Users", "user_id", user_id, {
      bank_balance: (bank_balance + amount).toString()
    });

    return bank_balance + amount;
  }

  /**
   * Decrease a user's wallet balance by the given amount
   * @param user_id The ID of the user to decrease the wallet balance of
   * @param amount The amount to decrease the wallet balance by (must be positive)
   * @returns The user's new wallet balance
   * @throws {Error} If the user does not have enough money in their wallet
   * @throws {Error} If the amount is negative
   */
  public static decrease_user_wallet_balance(user_id: UserID, amount: number): number {
    const wallet_balance = this.get_user_wallet_balance(user_id);

    if (wallet_balance < 0) throw new Error("Amount must be positive");
    if (wallet_balance < amount) throw new Error("Insufficient funds");

    Database.patch_where("Users", "user_id", user_id, {
      wallet_balance: (wallet_balance - amount).toString()
    });

    return wallet_balance - amount;
  }

  /**
   * Decrease a user's bank balance by the given amount
   * @param user_id The ID of the user to decrease the bank balance of
   * @param amount The amount to decrease the bank balance by (must be positive)
   * @returns The user's new bank balance
   * @throws {Error} If the user does not have enough money in their bank
   * @throws {Error} If the amount is negative
   */
  public static decrease_user_bank_balance(user_id: UserID, amount: number): number {
    const bank_balance = this.get_user_bank_balance(user_id);

    if (bank_balance < 0) throw new Error("Amount must be positive");
    if (bank_balance < amount) throw new Error("Insufficient funds");
    
    Database.patch_where("Users", "user_id", user_id, {
      bank_balance: (bank_balance - amount).toString()
    });

    return bank_balance - amount;
  }

  /**
   * Withdraw money from a user's bank to their wallet
   * @param user_id The ID of the user to withdraw money from
   * @param amount The amount to withdraw (must be positive)
   * @returns The user's new wallet balance
   * @throws {Error} If the user does not have enough money in their bank
   * @throws {Error} If the amount is negative
   */
  public static user_withdraw_money_from_bank(user_id: UserID, amount: number): number {
    if (amount < 0) throw new Error("Amount must be positive");
    this.decrease_user_bank_balance(user_id, amount);
    return this.increase_user_wallet_balance(user_id, amount);
  }

  /**
   * Deposit money from a user's wallet to their bank
   * @param user_id The ID of the user to deposit money to
   * @param amount The amount to deposit (must be positive)
   * @returns The user's new bank balance
   * @throws {Error} If the user does not have enough money in their wallet
   * @throws {Error} If the amount is negative
   */
  public static user_deposit_money_to_bank(user_id: UserID, amount: number): number {
    if (amount < 0) throw new Error("Amount must be positive");
    this.decrease_user_wallet_balance(user_id, amount);
    return this.increase_user_bank_balance(user_id, amount);
  }

  

  /*** Rock Paper Scissors ***/



  /**
   * Create a room for the rock-paper-scissors game. Note: this does not take any money from the players as rooms are created before players join
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
   * Delete a rock-paper-scissors room
   * @param room_id The ID of the room to delete
   */
  public static rps_delete_room(room_id: RoomID): void {
    this.room_ids.splice(this.room_ids.indexOf(room_id), 1);
    delete this.server.rps[room_id];
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
   * Get all rock-paper-scissors rooms
   * @returns All rock-paper-scissors rooms
   */
  public static rps_get_all_rooms(): Array<RPSRoom> {
    return Object.values(this.server.rps);
  }

  /**
   * Add a player to a rock-paper-scissors room
   * @param room_id The ID of the room the player is joining
   * @param user_id The ID of the player joining the room
   * @returns Whether the room is now full and ready to start
   * @throws {Error} If the room is already full prior to join, if the game is already in progress, or if the user is already in the room
   */
  public static rps_join_room(room_id: RoomID, user_id: UserID, ws: any): boolean {  
    this.server.rps[room_id].add_player(user_id, ws);
    return this.server.rps[room_id].room_full();
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
      this.decrease_user_wallet_balance(player.user_id, room.wager);
      
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
    this.server.rps[room_id].set_player_choice(player_id, choice);
    return this.server.rps[room_id].room_full();
  }

  /**
   * Decide the winner of a rock-paper-scissors game
   * @note This function assumes that both players have chosen
   * @param room_id The ID of the room to get the winner of
   * @returns The ID of the winner, or null if there is no winner
   */
  public static rps_decide_winner(room_id: RoomID): IPlayer | null {
    const player1: IPlayer = this.server.rps[room_id].get_player_by_number(1)!;
    const player2: IPlayer = this.server.rps[room_id].get_player_by_number(2)!;

    const player1_choice: rps_choice = this.server.rps[room_id].get_player_choice(player1.user_id);
    const player2_choice: rps_choice = this.server.rps[room_id].get_player_choice(player2.user_id);

    // tie
    if (player1_choice === player2_choice) return null;
    
    // rock vs paper
    if (player1_choice === "rock") {
      if (player2_choice === "paper") return player2;
      else return player1;
    }
    
    // paper vs scissors
    if (player1_choice === "paper") {
      if (player2_choice === "scissors") return player2;
      else return player1;
    }

    // scissors vs rock
    if (player2_choice === "rock") return player2;
    else return player1;
  }
}
