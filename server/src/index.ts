import router from "./routes/router";
import express from "express";
import express_ws from "express-ws";

import User, { IUser, UserID } from "./models/user";
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



/********************************************/
/*** Express - Login, Register, & GetUser ***/
/********************************************/



/**
 * Register to Arcade
 * @returns UserID
 */
app.post("/api/register", router.main.register);

/**
 * Login to Aracade
 * @returns UserID
 */
app.post("/api/login", router.main.login);

/**
 * Get a user by ID
 * @returns User object
 */
app.get("/api/user/:user_id", router.main.get_user_by_id);



/******************************/
/*** Express - Create Rooms ***/
/******************************/



/**
 * Create a room for the Rock Paper Scissors game
 * @returns The ID of the room
 */
app.post("/api/rps/create", router.rps.create_room);

/**
 * Create a room for the Hi-Lo game
 * @returns The ID of the room
 */
app.post("/api/hilo/create", async (req: any, res: any) => {
  // res.code(200).send(await Server.hilo_create_room());
  // TODO: implement
});



/***********************************/
/*** Websocket - Join/Play Games ***/
/***********************************/



/**
 * Websocket for the Rock Paper Scissors game - handles joining, playing, and finishing
 * @param room_id The ID of the room - url param
 * @param user_id The ID of the user - query param
 */
ws_app.ws("/api/rps/:room_id", router.rps.websocket);

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Arcade server listening @ http://localhost:3000");
});