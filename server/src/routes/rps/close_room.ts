import Database from "../../../mdb_local";
import { IStatsRPS } from "../../models/stats";
import User, { UserID } from "../../models/user";
import Server, { RoomID } from "../../server";

export default function close_room(req: any, res: any) {
  const room_id: RoomID = req.params.room_id;
  const game: GameName = req.params.game;
  const wager: number = req.body.wager;
  const winner: UserID = req.body.winner;
  const loser: UserID = req.body.loser;
  // Information for stats, which is not specific to each game. In RPS for example, this would be telling which move the winner and loser made
  const extra_info: object = req.body.extra_info;

  if (!wager) return res.status(400).send('wager field (number) is required');
  if (!winner) return res.status(400).send('winner field (user id) is required');
  if (!loser) return res.status(400).send('loser field (user id) is required');
  if (!game) return res.status(400).send('game field (the name of the game) is required');
  if (!room_id) return res.status(400).send('room_id field is required');
  if (Server.room_exists("RPS", room_id)) return res.status(400).send(`RPS room with ID ${room_id} not found`);

  if (game == "RPS")

  // Log game
  Database.post("GameLog", { game: "RPS", room_id, winner, wager: wager.toString(), timestamp: Date.now().toString() });
  
  // Update balances
  const winner_obj: User = User.get_user(winner);
  winner_obj.increase_wallet_balance(wager * 2); // winner gets their wager back plus the loser's wager
  // loser balance does not need to be altered as both players pay to join the room

  // Update stats
  const stats: IStatsRPS = winner_obj.get_stats("RPS");
  Database.patch_where("StatsRPS", "user_id", winner, {
    wins: (stats.wins + 1).toString(),
    total_wagered: (stats.total_wagered + wager).toString(),
    winnings: (stats.winnings + wager).toString(),
    rooms_played_in: stats.rooms_played_in.push(room_id).toString(),
    rocks: extra_info["winner_move"] === "rock" ? (stats.rocks + 1).toString() : stats.rocks.toString(),
    papers: extra_info["winner_move"] === "paper" ? (stats.papers + 1).toString() : stats.papers.toString(),
    scissors: extra_info["winner_move"] === "scissors" ? (stats.scissors + 1).toString() : stats.scissors.toString()
  });

  Server.RPS_delete_room(room_id);
  res.status(200).send(`RPS room with ID ${room_id} closed`);
}
