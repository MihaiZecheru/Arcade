import router from "./routes/router";
import express from "express";
import express_ws from "express-ws";

import { IUser, UserID } from "./models/user";
import Database, { TEntry } from "../mdb_local/index";
import { RoomID } from "./server";
import IGameLog from "./models/gamelog";
Database.connect();

Database.set_table_parse_function("Users", (entry: TEntry): IUser => {
  let user: IUser = {} as IUser;
  user.id = entry.user_id as UserID;
  user.username = entry.username;
  user.password = entry.password;
  user.wallet_balance = parseInt(entry.wallet_balance); // only modified fields
  user.bank_balance = parseInt(entry.bank_balance); // only modified fields
  user.email = entry.email;
  user.birthday = entry.birthday;
  user.joined = entry.joined;
  return user;
});

Database.set_table_parse_function("GameLog", (entry: TEntry): IGameLog => {
  let gamelog: IGameLog = {} as IGameLog;
  gamelog.game = entry.game;
  gamelog.room_id = entry.room_id as RoomID;
  gamelog.players = JSON.parse(entry.players) as Array<UserID>;
  gamelog.winner = entry.winner as UserID;
  gamelog.wager = parseInt(entry.wager);
  gamelog.timestamp = parseInt(entry.timestamp);
  return gamelog;
});

const app = express();
const ws_app = express_ws(app).app;
app.use(express.json());



/********************************************/
/*** Express - Login, Register, & GetUser ***/
/********************************************/
app.get("/", (req, res) => {
  res.send("Arcade server running");
});


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



/**********************************/
/*** Express - Money Management ***/
/**********************************/


/**
 * Get the total balance of a user, the sum of both the bank and wallet balances
 * @param user_id UserID - url param
 */
app.get("/api/user/:user_id/balance/total", router.money.get_total_balance);

/**
 * Get the bank balance of a user
 * @param user_id UserID - url param
 */
app.get("/api/user/:user_id/balance/bank", router.money.get_bank_balance);

/**
 * Get the wallet balance of a user
 * @param user_id UserID - url param
 */
app.get("/api/user/:user_id/balance/wallet", router.money.get_wallet_balance);

/**
 * Deposit money from a user's wallet to their bank
 * @param user_id UserID - url param
 * @param amount int - Body param
 */
app.put("/api/user/:user_id/balance/deposit", router.money.deposit_money_to_bank);

/**
 * Withdraw money from a user's bank to their wallet
 * @param user_id UserID - url param
 * @param amount int - Body param
 */
app.put("/api/user/:user_id/balance/withdraw", router.money.withdraw_money_from_bank);



/******************************/
/*** Express - Create Rooms ***/
/******************************/



/**
 * Create a room for the Rock Paper Scissors game
 * @param wager int - body param
 * @returns RoomID
 */
app.post("/api/RPS/create", router.RPS.create_room);



/******************************/
/**** Express - Get Rooms *****/
/******************************/



/**
 * Get all Rock Paper Scissors rooms
 * @returns Array<RPSRoom>
 */
app.get("/api/RPS/all", router.RPS.get_all_rooms);

/**
 * Get Rock Paper Scissors room by ID
 * @param room_id RoomID - url param
 * @returns RPSRoom object
 */
app.get("/api/RPS/:room_id", router.RPS.get_room_by_id);



/********************************/
/**** Express - Close Rooms *****/
/********************************/



/**
 * Close a RPSRoom
 * Closing a room will delete it from the server,
 * will update the stats for each of the players,
 * and will update the wallet balances of the winning player
 * @param room_id RoomID - url param
 * @param winner UserID - body param
 * @param loser UserID - body param
 * @param wager int - body param
 * @returns success message
 */
app.get("/api/RPS/:room_id/close", router.RPS.close_room);



/***********************************/
/*** Websocket - Join/Play Games ***/
/***********************************/



/**
 * Websocket for the Rock Paper Scissors game - handles joining, playing, and finishing
 * @param room_id RoomID - url param
 * @param user_id The ID of the user joining (UserID) - query param
 * @returns void
 */
ws_app.ws("/api/RPS/:room_id", router.RPS.websocket);

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Arcade server listening @ http://localhost:3000");
});