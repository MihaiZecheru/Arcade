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
        var mode = AnsiConsole.Prompt(new SelectionPrompt<string>()
            .Title("[blue]Choose mode:[/]")
            .AddChoices(new[] {
                "[blue]Multiplayer[/]",
                "[blue]Single player (vs CPU)[/]"
            }
            ).HighlightStyle(ArcadeLib.TextColor.GoldColor)
        );

        if (mode == "[blue]Multiplayer[/]")
            return ArcadeLib.MenuOption.PLAY_MULTIPLAYER;
        else
            return ArcadeLib.MenuOption.PLAY_SOLO;
    }

    /// <summary>
    /// Prompt the user to choose a room to join, return the selected room
    /// </summary>
    /// <param name="room_type">The type of room/the name of the game, ex: 'rps', 'hilo', etc.</param>
    /// <returns>The ID of the room the user wants to join</returns>
    public static async Task<ArcadeLib.UUID> SelectRoom(string room_type)
    {
        List<ArcadeLib.Rooms.IRoom> rooms = new List<ArcadeLib.Rooms.IRoom>();
        switch (room_type)
        {
            case "rps":
                rooms.AddRange(await ArcadeLib.Rooms.RockPaperScissorsRoom.GetRooms());
                break;

            default:
                throw new Exception($"No game exists with the name '{room_type}'. What game are you trying to get rooms for?");
        }

        List<string> options = new List<string>() { "[blue]Create Room[/]" };
        rooms.ForEach((ArcadeLib.Rooms.IRoom room) => options.Add($"[blue]{room.id}[/]"));
        
        var selected_room_id = AnsiConsole.Prompt(new SelectionPrompt<string>()
            .Title("[blue]Join a room or create your own[/]")
            .AddChoices(options)
            .HighlightStyle(ArcadeLib.TextColor.GoldColor)
        );

        // Remove the color tags from the selected room
        selected_room_id = selected_room_id.Replace("[blue]", "").Replace("[/]", "");

        if (selected_room_id == "Create Room")
        {
            return await CreateRoomPrompt(room_type);
        }

        return selected_room_id;
    }

    public static async Task<ArcadeLib.UUID> CreateRoomPrompt(string room_type)
    {
        // Get wager from user
        int wager;
        while (true)
        {
            Console.Clear();
            AnsiConsole.Markup("[blue]Set a wager for the room:[/]");

            string res = AnsiConsole.Prompt(
                new TextPrompt<string>("")
                    .PromptStyle(new Style().Foreground(Color.Gold1))
            );

            if (int.TryParse(res, out wager)) break;
            else
            {
                AnsiConsole.MarkupLine($"[red]Invalid wager - must be an integer greater than 0[/]");
                ArcadeLib.Misc.DelayWithBreak(1500);
            }
        }

        // Create the room with the wager
        return await ArcadeLib.ArcadeServerAPI.CreateRoom(room_type, wager);
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
