import Database from "../../mdb_local";
import GameName from "../models/gamename";
import IStats from "../models/stats";
import User, { UserID } from "../models/user";
import Server, { RoomID } from "../server";

function update_stats(game: GameName, room_id: RoomID, player: UserID, wager: number) {
  const player_stats: IStats = User.get_user(player).get_stats(game);
  Database.patch_where(`Stats${game}`, "user_id", player, {
    wins: (player_stats.wins + 1).toString(),
    total_wagered: (player_stats.total_wagered + wager).toString(),
    winnings: (player_stats.winnings + wager).toString(),
    rooms_played_in: player_stats.rooms_played_in.push(room_id).toString()
  });
}

export default function close_room(req: any, res: any) {
  const room_id: RoomID = req.params.room_id;
  const game: GameName = req.params.game;
  const wager: number = req.body.wager;
  const winner: UserID = req.body.winner;
  const loser: UserID = req.body.loser;

  if (!wager) return res.status(400).send('wager field (number) is required');
  if (!winner) return res.status(400).send('winner field (user id) is required');
  if (!loser) return res.status(400).send('loser field (user id) is required');
  if (!game) return res.status(400).send('game field (the name of the game) is required');
  if (!room_id) return res.status(400).send('room_id field is required');
  if (Server.room_exists(game, room_id)) return res.status(400).send(`${game} room with ID ${room_id} not found`);

  // Log game
  Database.post("GameLog", { game, room_id, winner, wager: wager.toString(), timestamp: Date.now().toString() });
  
  // Update balances
  User.get_user(winner).increase_wallet_balance(wager * 2); // winner gets their wager back plus the loser's wager
  // loser balance does not need to be altered as both players pay to join the room

  // Update player stats
  update_stats(game, room_id, winner, wager);
  update_stats(game, room_id, winner, wager);

  Server.delete_room(game, room_id);
  res.status(200).send(`${game} room with ID ${room_id} closed`);
}