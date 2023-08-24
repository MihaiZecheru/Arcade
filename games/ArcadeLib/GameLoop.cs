namespace ArcadeLib;

public static class GameLoop
{
    /// <summary>
    /// Present the user with the Main Menu and return his choice. Uses the <paramref name="gamename"/> as a header
    /// </summary>
    /// <param name="gamename">The name of the game the menu is being used for</param>
    /// <returns>The user's choice from the menu</returns>
    public static ArcadeLib.MenuOption MainMenu(string gamename)
    {
        return ArcadeLib.MenuOption.PLAY_SOLO; //TODO: Implement
        return ArcadeLib.MenuOption.PLAY_MULTIPLAYER;
    }

    public static ArcadeLib.Rooms.RockPaperScissorsRoom RoomMenuGetRoom()
    {
        return null; //TODO: Implement
    }

    /// <summary>
    /// Prompts the user for a wager >= 1
    /// </summary>
    /// <returns>The amount of tokens the user would like to bet, must be at least 1</returns>
    public static int Bet()
    {
        return 0; //TODO: Implement
    }
}
