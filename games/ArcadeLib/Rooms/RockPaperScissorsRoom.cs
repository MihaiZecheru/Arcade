namespace ArcadeLib.Rooms;

public class RockPaperScissorsRoom : ArcadeLib.Rooms.IRoom
{
    /// <summary>
    /// The players in the room
    /// </summary>
    public List<ArcadeLib.ArcadeUser> users { get; set; }

    /// <summary>
    /// Has the game started?
    /// </summary>
    public bool game_started { get; set; }

    /// <summary>
    /// The room's ID
    /// </summary>
    public ArcadeLib.UUID id { get; set; }

    /// <summary>
    /// The room's wager - the bet that must be placed to join the room
    /// </summary>
    public int wager { get; set; }

    /// <summary>
    /// Get the amount of players in the room
    /// </summary>
    /// <returns></returns>
    public int user_count()
    {
        return users.Count;
    }

    /// <summary>
    /// Get all active joinable Rock Paper Scissors rooms
    /// </summary>
    /// <returns>All active joinable Rock Paper Scissors rooms</returns>
    public static List<ArcadeLib.Rooms.RockPaperScissorsRoom> GetRooms()
    {
        return ArcadeLib.ArcadeServerAPI.GetRoomsRockPaperScissors();
    }
}
