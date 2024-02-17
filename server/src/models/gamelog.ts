import { RoomID } from "../server";
import { UserID } from "./user";

export default interface IGameLog {
  /**
   * The name of the game
   */
  game: string;

  /**
   * The ID of the room the game was played in
   */
  room_id: RoomID;

  /**
   * IDs of the players who participated in the game
   */
  players: Array<UserID>;

  /**
   * The ID of the player who won the game
   */
  winner: UserID;

  /**
   * The amount of money wagered on the game
   */
  wager: number;

  /**
   * When the game was played (ms)
   */
  timestamp: number;
}