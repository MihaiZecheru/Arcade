import Database from "../../../mdb_local";
import { is_uuid } from "../../models/ID";
import { IUser } from "../../models/user";
import Server from "../../server";

export default function get_bank_balance(req: any, res: any): void {
  const user_id = req.params.user_id;

  if (user_id === undefined) res.status(400).send("Missing user_id");
  if (typeof user_id !== "string" || is_uuid(user_id)) res.status(400).send("Invalid user_id");

  const users: Array<IUser> = Database.get_where<IUser>("Users", "user_id", user_id);
  if (users.length === 0) res.status(400).send("User not found");
  
  try {
    return res.status(200).send(Server.get_user_bank_balance(user_id));
  } catch (err: any) {
    return res.status(500).send("Internal server error");
  }
}
