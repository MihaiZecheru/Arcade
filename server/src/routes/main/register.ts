import Database from "../../../mdb_local";
import User, { USER_STARTING_BANK_BALANCE } from "../../models/user";

export default function register(req: any, res: any): void {
  try {
    const { username, password, email, birthday } = req.body;
    if (Object.keys(req.body).length > 4) throw new Error("Too many fields in data");
    const user_id = User.generate_id();
    Database.post("Users", { user_id, username, password, wallet_balance: "0", bank_balance: USER_STARTING_BANK_BALANCE.toString(), email, birthday, joined: new Date().toLocaleDateString() });
    return res.status(200).send(user_id);
  } catch (err: any) {
    if (err.message === "Too many fields in data" || err.message === "Field 'password' is missing in data")
      return res.status(400).send(err.message);
    return res.status(500).send("Internal server error");
  }
}
