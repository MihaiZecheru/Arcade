import { UserID } from "./user";

export default interface IPlayer {
  /**
   * The ID of the user in the database
   */
  user_id: UserID;

  /**
   * The number of the player, ie. player 1, player 2, etc.
   */
  player_number: number;

  /**
   * Websocket connection the player has made
   */
  ws: any;
}