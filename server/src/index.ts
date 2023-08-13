import express from "express";
import express_ws from "express-ws";

import Server from "./models/server";
import User from "./models/user";

import Database from "../mdb_local/index";
Database.connect();

const app = express();
const ws_app = express_ws(app).app;
app.use(express.json());



/************************************/
/*** Express - Login & Register ***/
/************************************/



app.get("/register", async (req: any, res: any) => {
  try {
    const { username, password, email, birthday } = req.body;
    const user_id = await User.generate_id();
    Database.post("Users", { user_id, username, password, balance: "250", email, birthday, joined: new Date().toLocaleDateString() });
    res.status(200).send(user_id);
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/login", async (req: any, res: any) => {
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



/******************************/
/*** Express - Create Rooms ***/
/******************************/



/**
 * Create a room for the Rock Paper Scissors game
 * @returns The ID of the room
 */
app.post("/rps/create", async (req: any, res: any) => {
  res.code(200).send(await Server.rps_create_room());
});

/**
 * Create a room for the Hi-Lo game
 * @returns The ID of the room
 */
app.post("/hilo/create", async (req: any, res: any) => {
  // res.code(200).send(await Server.hilo_create_room());
});



/***********************************/
/*** Websocket - Join/Play Games ***/
/***********************************/



/**
 * Websocket for the Rock Paper Scissors game
 */
ws_app.ws("/rps/:room_id", (ws: any, req: any) => {
  const room_id = req.params.room_id;
  
  ws.on("message", (msg: any) => {
    console.log(msg.toString());
  });
});

app.listen(3000, () => {
  console.log("Express server listening @ http://localhost:3000");
});