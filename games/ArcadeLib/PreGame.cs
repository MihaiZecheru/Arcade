namespace ArcadeLib;

using Spectre.Console;
using Spectre.Console.Advanced;

public static class PreGame
{
    /// <summary>
    /// Present the user with the Main Menu and return his choice. Uses the <paramref name="gamename"/> as a header
    /// </summary>
    /// <param name="gamename">The name of the game the menu is being used for</param>
    /// <returns>The user's choice from the menu</returns>
    public static ArcadeLib.MenuOption MainMenu(string gamename)
    {
        // TODO: make prettier
        var mode = AnsiConsole.Prompt(new SelectionPrompt<string>()
            .Title("Choose mode")
            .AddChoices(new[] {
                "Multiplayer",
                "Single player (vs CPU)"
            }
        ));

        if (mode == "Multiplayer")
            return ArcadeLib.MenuOption.PLAY_MULTIPLAYER;
        else
            return ArcadeLib.MenuOption.PLAY_SOLO;
    }

    public static ArcadeLib.Rooms.RockPaperScissorsRoom RoomMenuGetRoom()
    {
        
        return null; //TODO: Implement
    }

    /// <summary>
    /// Prompts the user for a wager
    /// </summary>
    /// <returns>The amount of tokens the user would like to bet, must be at least 1</returns>
    public static int PlaceBet()
    {
        return 0; //TODO: Implement
    }
}
