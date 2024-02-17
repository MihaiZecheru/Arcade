import Server from "../../server";

export default function get_all_rooms(req: any, res: any): void {
  try {
    return res.status(200).send(Server.RPS_get_all_rooms());
  } catch (err: any) {
    return res.status(500).send("Internal server error");
  }
}
