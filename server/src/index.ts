import router from "./routes/router";
import express from "express";
import express_ws from "express-ws";

import { IUser, UserID } from "./models/user";
import Database, { TEntry } from "../mdb_local/index";
Database.connect();

Database.set_table_parse_function("Users", (entry: TEntry): IUser => {
  let user: IUser = {} as IUser;
  user.id = entry.user_id as UserID;
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
 * @param username string - Body param
 * @param password string - Body param
 * @param email string - Body param
 * @param birthday string - Body param
 * @returns UserID
 */
app.post("/api/register", router.main.register);

/**
 * Login to Aracade
 * @param username string - Body param
 * @param password string - Body param
 * @returns UserID
 */
app.post("/api/login", router.main.login);

/**
 * Get a user by ID
 * @param user_id UserID - url param
 * @returns User object
 */
app.get("/api/user/:user_id", router.main.get_user_by_id);



/******************************/
/*** Express - Create Rooms ***/
/******************************/



/**
 * Create a room for the Rock Paper Scissors game
 * @param wager int - body param
 * @returns RoomID
 */
app.post("/api/rps/create", router.rps.create_room);



/******************************/
/**** Express - Get Rooms *****/
/******************************/



/**
 * Get all Rock Paper Scissors rooms
 * @returns Array<RPSRoom>
 */
app.get("/api/rps/all", router.rps.get_all_rooms);

/**
 * Get Rock Paper Scissors room by ID
 * @param room_id RoomID - url param
 * @returns RPSRoom object
 */
app.get("/api/rps/:room_id", router.rps.get_room_by_id);



/***********************************/
/*** Websocket - Join/Play Games ***/
/***********************************/



/**
 * Websocket for the Rock Paper Scissors game - handles joining, playing, and finishing
 * @param room_id RoomID - url param
 * @param user_id The ID of the user joining (UserID) - query param
 * @returns void
 */
ws_app.ws("/api/rps/:room_id", router.rps.websocket);

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Arcade server listening @ http://localhost:3000");
});