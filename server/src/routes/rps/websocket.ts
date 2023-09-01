import Database from "../../../mdb_local";
import { rps_choice } from "../../models/games/rps";
import IPlayer from "../../models/player";
import { RPSRoom } from "../../models/rooms";
import Server from "../../models/server";
import { UserID } from "../../models/user";

export default function websocket(ws: any, req: any): void {
  const room_id = req.params.room_id;
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
  if (!Server.room_exists("rps", room_id)) {
    ws.send("Room does not exist");
    return ws.close();
  }

  const room_is_full: boolean = Server.rps_join_room(room_id, user_id, ws);
  console.log(`User ${user_id} connected to rock-paper-scissors room ${room_id}`);
  ws.send(`connected to room ${room_id}`);

  if (room_is_full) {
    Server.rps_start_game(room_id);
  }

  ws.on("message", (msg: any) => {
    /**
     * Messages will be in the format:
     * player  choice
     * {1 | 2}{r | p | s}
     * 1p, 2s, 1r, 2p, etc.
     */

    const room: RPSRoom = Server.rps_get_room(room_id);

    const player_number: number = parseInt(msg[0]);
    const choice: rps_choice = msg[1] === 'r' ? "rock" : msg[1] === 'p' ? "paper" : "scissors";
    const player_user_id: UserID = room.get_player_by_number(player_number)?.user_id!;
    
    const ready = Server.rps_player_choose(room_id, player_user_id, choice);
    
    // Play the game
    if (ready) {
      // both players have chosen
      const winner = Server.rps_decide_winner(room_id);
      const players = room.players;
      const wager = room.wager;

      if (winner === null) {
        players.forEach((player: IPlayer) => {
          player.ws.send("tie");
        });
      } else {
        players.forEach((player: IPlayer) => {
          if (player.user_id === winner.user_id) {
            player.ws.send("winner");
            Server.increase_user_balance(player.user_id, wager);
          } else {
            player.ws.send("loser");
          }
        });
      }
    }
  });
}
