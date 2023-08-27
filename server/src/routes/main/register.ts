import Database from "../../../mdb_local";
import User, { USER_STARTING_BALANCE } from "../../models/user";

export default async function register(req: any, res: any): Promise<void> {
  try {
    const { username, password, email, birthday } = req.body;
    console.log(req.body, Object.keys(req.body).length)
    if (Object.keys(req.body).length > 4) throw new Error("Too many fields in data");
    const user_id = await User.generate_id();
    Database.post("Users", { user_id, username, password, balance: USER_STARTING_BALANCE.toString(), email, birthday, joined: new Date().toLocaleDateString() });
    return res.status(200).send(user_id);
  } catch (err) {
    return res.status(400).send(err.message);
  }
}