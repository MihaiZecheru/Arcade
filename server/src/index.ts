import express from "express";
import express_ws from "express-ws";

import Server from "./models/server";
import User from "./models/user";

import Database from "../mdb_local/index";
import Player from "./models/player";
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
 * @param room_id The ID of the room - url param
 * @param user_id The ID of the user - query param
 */
ws_app.ws("/rps/:room_id", (ws: any, req: any) => {
  const room_id = req.params.room_id;
  const user_id = req.query.user_id;

  // check if user_id was provided
  if (!user_id) {
    ws.send("User ID not provided");
    return ws.close();
  }

  // check if user exists
  if (Database.get_where("Users", "user_id", user_id).length === 0) {
    ws.send("User does not exist");
    return ws.close();
  }

  // check if room exists
  if (!Server.room_exists("rps", room_id)) {
    ws.send("Room does not exist");
    return ws.close();
  }

  const room_is_full: boolean = Server.rps_join_room(room_id, user_id, ws);
  console.log(`User ${user_id} connected to rock-paper-scissors room ${room_id}`);
  ws.send(`connected to room ${room_id}`);

  if (room_is_full) {
    Server.rps_start_game(room_id);
    // send message to all connected clients
    Server.rps_get_room(room_id).players.forEach((player: Player) => {
      player.ws.send("game started");
    });
  }

  ws.on("message", (msg: any) => {
    
  });
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Express server listening @ http://localhost:3000");
});