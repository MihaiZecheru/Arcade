import { RPSRoom } from "../../models/rooms";
import Server, { RoomID } from "../../server";

export default function get_room_by_id(req: any, res: any): void {
  try {
    const room_id: RoomID = req.params.id;
    if (!room_id || !Server.room_exists("RPS", room_id)) return res.status(404).send(`Room with ID '${room_id}' not found`);
    return res.status(200).send(Server.RPS_get_room(room_id));
  } catch (err: any) {
    return res.status(500).send("Internal server error");
  }
}
