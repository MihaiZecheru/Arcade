import Database from "../../../mdb_local";
import { is_uuid } from "../../models/ID";
import { IUser, UserID } from "../../models/user";
import Server from "../../server";

export default function deposit_money_to_bank(req: any, res: any): void {
  const user_id = req.params.user_id;
  if (typeof user_id !== "string" || !is_uuid(user_id)) return res.status(400).send("Invalid user_id");

  const users: Array<IUser> = Database.get_where<IUser>("Users", "user_id", user_id);
  if (users.length === 0) return res.status(400).send("User not found");
  
  const amount = req.body.amount;
  if (amount === undefined) return res.status(400).send("Missing amount");
  if (typeof amount !== "number") return res.status(400).send("Invalid amount");
  if (amount <= 0) return res.status(400).send("Amount must be positive");

  try {
    return res.status(200).send(Server.user_deposit_money_to_bank(user_id as UserID, amount));
  } catch (err: any) {
    if (err.message === "Insufficient funds") return res.status(400).send(err.message);
    return res.status(500).send("Internal server error");
  }
}
