import { rps_choice } from "./games/rps";
import IPlayer from "./player";
import { RoomID } from "../server";
import { UserID } from "./user";

/**
 * Contains the maximum amount of players any sub-class of RoomBaseClass can have, ie RPSRoom
 */
const ROOM_CAPS: { [room_name: string]: number } = {
  "RoomBaseClass": 2, // should not be used. only here for testing
  "RPSRoom": 2
};

function GET_MAX_ROOM_CAPACITY(classname: string): number {
  return ROOM_CAPS[classname];
}

/**
 * A base class for all rooms to inherit from
 */
export class RoomBaseClass {
  /**
   * The players currently in the room
   */
  public players: Array<IPlayer> = [];

  /**
   * Has the game started?
   */
  public game_started: boolean = false;

  /**
   * The ID of the room
   */
  public id: RoomID;

  /**
   * The bet being placed on the game
   */
  public wager: number;

  public constructor(room_id: RoomID, wager: number) {
    this.id = room_id;
    this.wager = wager;
  }

  /**
   * Get the number of players in the room
   * @returns The number of players in the room
   */
  public player_count(): number {
    return this.players.length;
  }

  /**
   * Add a player to the room
   * @param user_id The ID of the player to add to the room
   * @param ws The WebSocket connection the player has
   */
  public add_player(user_id: UserID, ws: any) {
    if (this.player_count() >= GET_MAX_ROOM_CAPACITY(this.constructor.name)) {
      throw new Error(`Room '${this.id}' is full`);
    }

    if (this.game_started) {
      throw new Error(`Room '${this.id}' has a game in progress - wait for the game to finish before joining`);
    }

    const player: IPlayer = {
      user_id, ws,
      player_number: this.player_count() + 1
    }

    // check if player already in room
    if (this.players.map((player: IPlayer) => player.user_id).includes(user_id)) {
      throw new Error(`User '${user_id}' is already in room '${this.id}'`);
    }

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
      throw new Error(`User '${user_id}' is not in room '${this.id}'`);
    }

    this.players = this.players.filter(player => player.user_id !== user_id);
  }

  /**
   * Get a player from the room by their number (player 1, player 2, etc.)
   * @param player_number The number of the player to get
   * @returns The player's ID
   * @throws {Error} If the player number is invalid
   */
  public get_player_by_number(player_number: number): IPlayer {
    if (player_number < 1 || player_number > this.player_count()) {
      throw new Error(`There is currently no player number '${player_number}' in room '${this.id}`);
    }

    return this.players[player_number - 1];
  }

  /**
   * Get a player from the room by their user ID
   * @param user_id The user ID of the player to get
   * @returns THe player with the given user ID
   */
  public get_player_by_user_id(user_id: UserID): IPlayer {
    const player = this.players.find(player => player.user_id === user_id);
    if (!player) throw new Error(`Player '${user_id}' is not in room '${this.id}'`);
    return player;
  }
}

/**
 * Rock Paper Scissors room
 */
export class RPSRoom extends RoomBaseClass {
  private player1_choice: rps_choice | null = null;
  private player2_choice: rps_choice | null = null;

  /**
   * Get a player's choice
   * @param user_id The ID of the player
   * @returns The player's choice (rock, paper, or scissors)
   */
  public get_player_choice(user_id: UserID): rps_choice;
  public get_player_choice(player_number: number): rps_choice;
  public get_player_choice(player: UserID | number): rps_choice {
    let _player: IPlayer;
    if (typeof player === "number") {
      try {
        _player = this.get_player_by_number(player);
      } catch (err) {
        throw new Error(`There is currently no player number '${player}' in room '${this.id}`);
      }
    }
    else {
      try {
        _player = this.get_player_by_user_id(player);
      } catch {
        throw new Error(`There is currently no player with user ID '${player}' in room '${this.id}`);
      }
    }

    let choice: rps_choice | null = (_player.player_number === 1) ? this.player1_choice : this.player2_choice;
    if (!choice) throw new Error(`Player '${_player.user_id}' has not made a choice yet`);
    return choice!;
  }

  /**
   * Set a player's choice
   * @param user_id The ID of the player
   * @param choice The player's choice (rock, paper, or scissors)
   */
  public set_player_choice(user_id: UserID, choice: rps_choice): void {
    const player = this.get_player_by_user_id(user_id);
    if (!player) throw new Error(`Player '${user_id}' is not in room '${this.id}`);

    if (player.player_number === 1) {
      this.player1_choice = choice;
    } else {
      this.player2_choice = choice;
    }
  }

  /**
   * Check if the room is full
   * @returns True if the room is full, false otherwise
   */
  public room_full(): boolean {
    return this.players.length == 2;
  }
}
