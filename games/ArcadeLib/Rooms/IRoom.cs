namespace ArcadeLib.Rooms;

public interface IRoom
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
}
