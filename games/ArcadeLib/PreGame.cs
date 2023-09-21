﻿namespace ArcadeLib;

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

        List<string> options = new List<string>() { "Create Room" };
        rooms.ForEach((ArcadeLib.Rooms.IRoom room) => options.Add(room.id.ToString()));
        
        var selected_room_id = AnsiConsole.Prompt(new SelectionPrompt<string>()
            .Title("Join a room or create your own")
            .AddChoices(options)
        );

        if (selected_room_id == "Create Room")
        {
            return await CreateRoomPrompt(room_type);
        }

        return selected_room_id;
    }

    public static async Task<ArcadeLib.UUID> CreateRoomPrompt(string room_type)
    {
        var wager = AnsiConsole.Prompt(
            new TextPrompt<int>("Set a wager for the room: ")
                .Validate(bet => bet >= 1 ? ValidationResult.Success() : ValidationResult.Error("Your wager must be at least 1 token")
        ));

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