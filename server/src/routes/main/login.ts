import Database from "../../../mdb_local";
import { IUser } from "../../models/user";

export default function login(req: any, res: any): void {
  try {
    const { username, password } = req.body;
    if (Object.keys(req.body).length > 2) throw new Error("Too many fields in data");
    const result: Array<IUser> = Database.get_where<IUser>("Users", "username", username);
    if (result.length === 0) throw new Error("User not found");
    const user: IUser = result[0];
    if (user.password !== password) throw new Error("Incorrect password");
    return res.status(200).send(user.id);
  } catch (err: any) {
    if (err.message === "Too many fields in data" || err.message === "User not found" || err.message === "Incorrect password")
      return res.status(400).send(err.message);
    return res.status(500).send("Internal server error");
  }
}
