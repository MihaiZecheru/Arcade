import Database from "../../../mdb_local";
import { IUser } from "../../models/user";

export default function login(req: any, res: any): Promise<void> {
  try {
    const { username, password } = req.body;
    if (Object.keys(req.body).length > 2) throw new Error("Too many fields in data");
    const user: IUser = Database.get_where("Users", "username", username, true) as IUser;
    if (!user) throw new Error("User not found");
    if (user.password !== password) throw new Error("Incorrect password");
    return res.status(200).send(user.user_id);
  } catch (err: any) {
    if (err.message === "Too many fields in data" || err.message === "User not found" || err.message === "Incorrect password")
      return res.status(400).send(err.message);
    return res.status(500).send("Internal server error");
  }
}
