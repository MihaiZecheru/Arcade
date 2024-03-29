import Server from "../../server";

export default function create_room(req: any, res: any): void {
  try {
    const wager: number = req.body.wager;
    if (wager <= 0) throw new Error("Wager must be greater than 0");
    if (Math.floor(wager) !== wager) throw new Error("Wager must be a whole number");
    return res.status(200).send(Server.RockPaperScissors_create_room(wager)); // returns RoomID
  } catch (err: any) {
    if (err.message === "Wager must be greater than 0" || err.message === "Wager must be a whole number")
      return res.status(400).send(err.message);
    return res.status(500).send("Internal server error");
  }
}
