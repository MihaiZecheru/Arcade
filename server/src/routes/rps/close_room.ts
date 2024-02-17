import Database from "../../../mdb_local";
import User, { UserID } from "../../models/user";
import Server, { RoomID } from "../../server";

export default function close_room(req: any, res: any) {
  const room_id: RoomID = req.params.room_id;
  const wager: number = req.body.wager;
  const winner: UserID = req.body.winner;
  const loser: UserID = req.body.loser;

  if (!room_id) return res.status(400).send('room_id is required');
  if (Server.room_exists("rps", room_id)) return res.status(400).send(`rps room with ID ${room_id} not found`);

  // Log game
  Database.post("GameLog", { game: "rps", room_id, winner, wager: wager.toString(), timestamp: Date.now().toString() });
  
  // Update balances
  User.get_user(winner).increase_wallet_balance(wager * 2); // winner gets their wager back plus the loser's wager
  // loser balance does not need to be altered as both players pay to join the room

  // Update stats

  Server.rps_delete_room(room_id);
  res.status(200).send(`rps room with ID ${room_id} closed`);
}