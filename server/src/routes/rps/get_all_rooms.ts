import { RPSRoom } from "../../models/rooms";
import Server from "../../server";

export default async function get_all_rooms(req: any, res: any): Promise<Array<RPSRoom>> {
  try {
    return res.status(200).send(Server.rps_get_all_rooms());
  } catch (err: any) {
    return res.status(500).send("Internal server error");
  }
}
