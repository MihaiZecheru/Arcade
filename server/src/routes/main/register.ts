import Database from "../../../mdb_local";
import User, { USER_STARTING_BALANCE } from "../../models/user";

export async function register(req: any, res: any) {
  try {
    const { username, password, email, birthday } = req.body;
    const user_id = await User.generate_id();
    Database.post("Users", { user_id, username, password, balance: USER_STARTING_BALANCE.toString(), email, birthday, joined: new Date().toLocaleDateString() });
    return res.status(200).send(user_id);
  } catch (err) {
    return res.status(400).send(err);
  }
}