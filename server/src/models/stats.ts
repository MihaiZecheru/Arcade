import { RoomID } from "../server";
import { UserID } from "./user";

export default interface IStats {
  user_id: UserID;
  wins: number;
  losses: number;
  total_wagered: number;
  winnings: number;
  money_lost: number;
  rooms_played_in: Array<RoomID>;
}
