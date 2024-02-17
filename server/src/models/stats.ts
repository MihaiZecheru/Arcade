import { RoomID } from "../server";
import { UserID } from "./user";

interface IStats {
  user_id: UserID;
  wins: number;
  losses: number;
  total_wagered: number;
  winnings: number;
  money_lost: number;
  rooms_played_in: Array<RoomID>;
}

export interface IStatsRPS extends IStats {
  rocks: number;
  papers: number;
  scissors: number;
}