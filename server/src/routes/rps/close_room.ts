import User, { UserID } from "../../models/user";
import Server, { RoomID } from "../../server";

export default function close_room(req: any, res: any) {
  const room_id: RoomID = req.params.room_id;
  const wager: number = req.body.wager;
  const winner: UserID = req.body.winner;
  const loser: UserID = req.body.loser;

  if (!room_id) return res.status(400).send('room_id is required');
  if (Server.room_exists("rps", room_id)) return res.status(400).send(`${game} room with ID ${room_id} not found`);

  User.get_user(winner).increase_wallet_balance(wager);

  Server.rps_delete_room(room_id);
  res.status(200).send(`rps room with ID ${room_id} closed`);
}