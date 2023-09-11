import { RPSRoom } from "../../models/rooms";
import Server, { RoomID } from "../../server";

export default async function get_room_by_id(req: any, res: any): Promise<RPSRoom> {
  try {
    const room_id: RoomID = req.params.room_id;
    if (!room_id || !Server.room_exists("rps", room_id)) return res.status(404).send(`Room with ID '${room_id}' not found`);
    return res.status(200).send(Server.rps_get_room(room_id));
  } catch (err: any) {
    return res.status(500).send("Internal server error");
  }
}
