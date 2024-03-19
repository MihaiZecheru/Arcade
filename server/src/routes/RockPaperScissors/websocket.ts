import Database from "../../../mdb_local";
import { RockPaperScissors_choice } from "../../models/games/RockPaperScissors";
import IPlayer from "../../models/player";
import { RockPaperScissorsRoom } from "../../models/rooms";
import Server, { RoomID } from "../../server";
import { UserID } from "../../models/user";

/**
 * Handles joining the room, playing the game, and finishing the game
 */
export default function websocket(ws: any, req: any): void {
  const room_id = req.params.id;
  const user_id = req.query.user_id;

  // check if user_id was provided
  if (!user_id) {
    ws.send("User ID not provided");
    return ws.close();
  }

  // check if user exists
  if (Database.get_where("Users", "user_id", user_id).length === 0) {
    ws.send("User does not exist");
    return ws.close();
  }

  // check if room exists
  if (!Server.room_exists("RockPaperScissors", room_id)) {
    ws.send("Room does not exist");
    return ws.close();
  }

  /**
   * The Server.RockPaperScissors_join_room function will handle errors with the room already being
   * at max capacity or the game already being in progress
   **/

  const room_is_ready: boolean = Server.RockPaperScissors_join_room(room_id, user_id, ws);
  ws.send(`connected to room ${room_id}`);

  if (room_is_ready) {
    Server.RockPaperScissors_start_game(room_id);
  }

  // ** play the game ** //
  ws.on("message", (msg: any) => on_message(msg, room_id));
}

function on_message(msg: any, room_id: RoomID): void {
  /**
   * Messages will be in the format:
   * player    choice
   * {1 | 2}{r | p | s}
   * 1p, 2s, 1r, 2p, etc.
   */

  const room: RockPaperScissorsRoom = Server.RockPaperScissors_get_room(room_id);
  const player_number: number = parseInt(msg[0]);
  const choice: RockPaperScissors_choice = msg[1] === 'r' ? "rock" : msg[1] === 'p' ? "paper" : "scissors";
  const player_user_id: UserID = room.get_player_by_number(player_number)?.user_id!;
  const end = Server.RockPaperScissors_player_choose(room_id, player_user_id, choice);

  // finish the game if both players have chosen
  if (end) finish_game(room);
}

function finish_game(room: RockPaperScissorsRoom): void {
  // both players have chosen
  const room_id = room.id;
  const winner = Server.RockPaperScissors_decide_winner(room_id);
  const players = room.players;
  const wager = room.wager;

  if (winner === null) tie(players);
  else win(players, winner, wager);
}

function tie(players: Array<IPlayer>): void {
  players.forEach((player: IPlayer) => {
    player.ws.send("tie");
  });
}

function win(players: Array<IPlayer>, winner: IPlayer, wager: number): void {
  players.forEach((player: IPlayer) => {
    if (player.user_id === winner.user_id) {
      player.ws.send("winner");
      Server.increase_user_wallet_balance(player.user_id, wager);
    } else {
      player.ws.send("loser");
    }
  });
}
// TODO: add unit testing