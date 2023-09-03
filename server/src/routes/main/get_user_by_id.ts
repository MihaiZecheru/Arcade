import Database from "../../../mdb_local";
import { IUser } from "../../models/user";

export default async function get_user_by_id(req: any, res: any): Promise<void> {
  try {
    const user_id = req.params.user_id;
    const users: Array<IUser> = Database.get_where("Users", "user_id", user_id) as Array<IUser>;
    if (users.length === 0) throw new Error("User not found");
    return res.status(200).send(users[0]);
  } catch (err: any) {
    if (err.message === "User not found")
      return res.status(400).send(err.message);
    return res.status(500).send("Internal server error");
  }
}
