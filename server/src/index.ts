import express from "express";
import express_ws from "express-ws";

import Server from "./models/server";
import User, { IUser, UserID } from "./models/user";

import IPlayer from "./models/player";
import { rps_choice } from "./models/games/rps";
import { RPSRoom } from "./models/rooms";
import Database, { TEntry } from "../mdb_local/index";
Database.connect();

Database.set_table_parse_function("Users", (entry: TEntry): IUser => {
  let user: IUser = {} as IUser;
  user.user_id = entry.user_id as UserID;
  user.username = entry.username;
  user.password = entry.password;
  user.balance = parseInt(entry.balance);
  user.email = entry.email;
  user.birthday = entry.birthday;
  user.joined = entry.joined;
  return user;
});

const app = express();
const ws_app = express_ws(app).app;
app.use(express.json());



/************************************/
/*** Express - Login & Register *****/
/************************************/



app.post("/api/register", async (req: any, res: any) => {
  try {
    const { username, password, email, birthday } = req.body;
    const user_id = await User.generate_id();
    Database.post("Users", { user_id, username, password, balance: "250", email, birthday, joined: new Date().toLocaleDateString() });
    return res.status(200).send(user_id);
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.post("/api/login", async (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const users = await Database.get_where("Users", "username", username);
    if (users.length === 0) throw "User not found";
    if (users[0].password !== password) throw "Incorrect password";
    return res.status(200).send(users[0].user_id);
  } catch (err) {
    return res.status(400).send(err);
  }
});



/******************************/
/*** Express - Create Rooms ***/
/******************************/



/**
 * Create a room for the Rock Paper Scissors game
 * @returns The ID of the room
 */
app.post("/api/rps/create", async (req: any, res: any) => {
  const wager: number = req.body.wager;
  if (wager <= 0) res.code(400).send("Wager must be greater than 0");
  if (Math.floor(wager) !== wager) res.code(400).send("Wager must be a whole number");
  return res.code(200).send(await Server.rps_create_room(wager));
});

/**
 * Create a room for the Hi-Lo game
 * @returns The ID of the room
 */
app.post("/api/hilo/create", async (req: any, res: any) => {
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
ws_app.ws("/api/rps/:room_id", (ws: any, req: any) => {
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
  }

  ws.on("message", (msg: any) => {
    /**
     * Messages will be in the format:
     * player  choice
     * {1 | 2}{r | p | s}
     * 1p, 2s, 1r, 2p, etc.
     */

    const room: RPSRoom = Server.rps_get_room(room_id);

    const player_number: number = parseInt(msg[0]);
    const choice: rps_choice = msg[1] === 'r' ? "rock" : msg[1] === 'p' ? "paper" : "scissors";
    const player_user_id: UserID = room.get_player_by_number(player_number)?.user_id!;
    
    const ready = Server.rps_player_choose(room_id, player_user_id, choice);
    
    // Play the game
    if (ready) {
      // both players have chosen
      const winner = Server.rps_decide_winner(room_id);
      const players = room.players;
      const wager = room.wager;

      if (winner === null) {
        players.forEach((player: IPlayer) => {
          player.ws.send("tie");
        });
      } else {
        players.forEach((player: IPlayer) => {
          if (player.user_id === winner.user_id) {
            player.ws.send("winner");
            Server.increase_user_balance(player.user_id, wager);
          } else {
            player.ws.send("loser");
          }
        });
      }
    }
  });
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Express server listening @ http://localhost:3000");
});