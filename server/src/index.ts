import Database from "../mdb_local/index";
Database.connect();

import User from "./models/user";

const express = require("express");
const app = express();
app.use(express.json());

app.get("/register/", async (req: any, res: any) => {
  try {
    const { username, password, email, birthday } = req.body;
    const user_id = await User.generate_id();
    Database.post("Users", { user_id, username, password, balance: "250", email, birthday, joined: new Date().toLocaleDateString() });
    res.status(200).send(user_id);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/login/", async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const user = await Database.get_where("Users", "username", username);
    if (user.length === 0) throw "User not found";
    if (user[0].password !== password) throw "Incorrect password";
    res.status(200).send(user[0].user_id);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/server/", (req: any, res: any) => {
  res.send("Hello world!");
});

app.listen(3000, () => {
  console.log("Server listening @ http://localhost:3000");
});