import Database from "../../../mdb_local";

export default async function login(req: any, res: any): Promise<void> {
  try {
    const { username, password } = req.body;
    if (Object.keys(req.body).length > 2) throw new Error("Too many fields in data");
    const users = await Database.get_where("Users", "username", username);
    if (users.length === 0) throw new Error("User not found");
    if (users[0].password !== password) throw new Error("Incorrect password");
    return res.status(200).send(users[0].user_id);
  } catch (err) {
    return res.status(400).send(err.message);
  }
}
