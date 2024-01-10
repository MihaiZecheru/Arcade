import Database from "../../../mdb_local";
import { is_uuid } from "../../models/ID";
import { IUser, UserID } from "../../models/user";
import Server from "../../server";

export default function get_bank_balance(req: any, res: any): void {
  const user_id = req.params.user_id;

  if (user_id === undefined) return res.status(400).send("Missing user_id");
  if (typeof user_id !== "string" || !is_uuid(user_id)) return res.status(400).send("Invalid user_id");

  const users: Array<IUser> = Database.get_where<IUser>("Users", "user_id", user_id);
  if (users.length === 0) return res.status(400).send("User not found");
  
  try {
    return res.status(200).send(Server.get_user_bank_balance(user_id as UserID));
  } catch (err: any) {
    return res.status(500).send("Internal server error");
  }
}
