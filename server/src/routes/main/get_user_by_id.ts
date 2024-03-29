import Database from "../../../mdb_local";
import { IUser } from "../../models/user";

export default function get_user_by_id(req: any, res: any): void {
  try {
    const user_id = req.params.user_id;
    const users: Array<IUser> = Database.get_where<IUser>("Users", "user_id", user_id);
    if (users.length === 0) throw new Error("User not found");
    return res.status(200).send(users[0]);
  } catch (err: any) {
    if (err.message === "User not found")
      return res.status(400).send(err.message);
    return res.status(500).send("Internal server error");
  }
}
